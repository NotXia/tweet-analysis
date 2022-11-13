const TweetStream = require("../modules/fetch/stream.js");
const ExceededStreamRulesCap = require("../modules/fetch/errors/ExceededStreamRulesCap.js");
const StreamUnavailable = require("../modules/fetch/errors/StreamUnavailable");


const EMPTY_RULE_TIMEOUT = 10000;   // Tempo dopo il quale una regola inutilizzata viene cancellata
const CLOSE_STREAM_TIMEOUT = 30000  // Tempo dopo il quale viene chiusa la connessione allo stream (se inutilizzato)

module.exports = {
    initTweetStreamSocket: init
}


let socketIO_namespace = null;


function init(socket_namespace) {
    socketIO_namespace = socket_namespace;

    socket_namespace.on("connection", (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        try {
            /**
             * Inizializzazione della connessione per ricevere tweet in tempo reale
             * 
         * 
             * 
             * Formato richiesta
             * {
             *      username:string     Username da cui ricevere
             *      keyword:string      Keyword da cui ricevere
             * }
             */
            socket.on("tweet.stream.init", async (data, response) => {
                if (!data || (!data.username && !data.keyword)) { return response({ status: "error", error: "Parametri mancanti" }); }
    
                try {
                    const rule_id = await TweetStream.addRule(data.username, data.keyword);
                    _abortStreamTimeout();
                    _abortRuleTimeout(rule_id);
                    _addConnection(socket, rule_id);
                    await TweetStream.openStream(_forwardTweetToClient, _disconnectAllClients);

                    console.log(socket.id, rule_id)

                    return response({ status: "success" });
                }
                catch (err) {
                    console.log(err)
                    if (err instanceof ExceededStreamRulesCap) { return response({ status: "error", error: "Limite di connessioni raggiunto" }) }
                    if (err instanceof StreamUnavailable) { return response({ status: "error", error: "Non è stato possibile stabilire una connessione" }) }
                    return response({ status: "error", error: "Si è verificato un errore" })
                }
            });
    
            socket.on("disconnect", () => {
                _disconnectClient(socket);
                console.log('🔥: A user disconnected');
            });
        }
        catch (err) {
            console.error(err)
        }
    });
}


let _rule_id_by_socket_id = {};     // Mappa socket_id al rule_id associato


/* Gestisce la registrazione di una nuova connessione */
function _addConnection(socket, rule_id) {
    socket.join(`${rule_id}`);

    // Associazione socket_id -> rule_id
    _rule_id_by_socket_id[socket.id] = rule_id;
}

/* Inoltra i tweet ai client interessati */
function _forwardTweetToClient(tweet, applied_rules_id) {
    console.log(tweet);
    for (const rule_id of applied_rules_id) {
        socketIO_namespace.to(`${rule_id}`).emit("tweet.stream.new", tweet);
    }
}

/* Gestisce la disconnessione di un client */
function _disconnectClient(disconnected_socket) {
    console.log(`Disconnection ${disconnected_socket.id}`);
    const to_update_rule_id = _rule_id_by_socket_id[disconnected_socket.id];
    
    // Rimuove l'associazione socket_id -> rule_id
    delete _rule_id_by_socket_id[disconnected_socket.id];

    _handleRuleTimeout(to_update_rule_id);
    _handleStreamTimeout();
}

/* Gestisce la disconnessione di tutti i client */
async function _disconnectAllClients() {
    console.log(`Disconnection all`);
    const sockets = await socketIO_namespace.fetchSockets();

    sockets.forEach((socket) => {
        _disconnectClient(socket);
        socket.disconnect();
    })
}


let _delete_request_by_rule_id = {};    // Mappa rule_id alla richiesta di eliminazione della regola

/* Gestisce l'avvio della cancellazione di una regola (se necessario) */
async function _handleRuleTimeout(rule_id) {
    const sockets = await socketIO_namespace.in(rule_id).fetchSockets();

    if (sockets.length === 0) {
        _abortRuleTimeout(rule_id); // Annulla la richiesta precedente
        console.log(`Start del rule ${rule_id}`);

        _delete_request_by_rule_id[rule_id] = setTimeout(async () => {
            await TweetStream.deleteRule(rule_id).catch((err) => { console.error(`Non è stato possibile eliminare la rule ${rule_id}`); });
            delete _delete_request_by_rule_id[rule_id];
            console.log(`Rule del ${rule_id}`);
        }, EMPTY_RULE_TIMEOUT);
    }
}

/* Annulla la richiesta di cancellazione per una regola */
function _abortRuleTimeout(rule_id) {
    if (_delete_request_by_rule_id[rule_id]) { 
        clearTimeout(_delete_request_by_rule_id[rule_id]);
        delete _delete_request_by_rule_id[rule_id];
        console.log(`Abort del rule ${rule_id}`);
    }
}


let _close_stream_request = null; // Richiesta di chiusura dello stream

/* Avvia la richiesta di chiusura dello stream */
async function _handleStreamTimeout() {
    const sockets = await socketIO_namespace.fetchSockets();

    if (sockets.length === 0) { // Nessuna connessione attiva
        _abortStreamTimeout(); // Annulla la richiesta precedente
        console.log(`Start stop stream`);

        _close_stream_request = setTimeout(() => {
            TweetStream.closeStream();
            _close_stream_request = null;

            _rule_id_by_socket_id = {}
            console.log(`Stream stopped`);
        }, CLOSE_STREAM_TIMEOUT);
    }
}

/* Annulla la richiesta di chiusura dello stream */
function _abortStreamTimeout() {
    if (_close_stream_request) { 
        clearTimeout(_close_stream_request); 
        _close_stream_request = null;
        console.log(`Abort stream stopped`);
    }
}