const TweetStream = require("../modules/fetch/stream.js");
const ExceededStreamRulesCap = require("../modules/fetch/errors/ExceededStreamRulesCap.js");
const StreamUnavailable = require("../modules/fetch/errors/StreamUnavailable");


const EMPTY_RULE_TIMEOUT = 10000;   // Tempo dopo il quale una regola viene cancellata
const CLOSE_STREAM_TIMEOUT = 30000  // Tempo dopo il quale viene chiusa la connessione allo stream

module.exports = {
    initTweetStreamSocket: init
}


function init(socket) {
    try {
        /**
         * Inizializzazione della connessione per ricevere tweet in tempo reale
         * 
         * Formato richiesta
         * {
         *      username:string     Username da cui ricevere
         *      keyword:string      Keyword da cui ricevere
         * }
         */
        socket.on("tweet.stream.init", async (data, response) => {
            if (!data || (!data.username && !data.keyword)) { return response({ error: "Parametri mancanti" }); }

            try {
                const rule_id = await TweetStream.addRule(data.username, data.keyword);
                _abortStreamTimeout();
                _abortRuleTimeout(rule_id);
                _addConnection(socket, rule_id);
                await TweetStream.openStream(_forwardTweetToClient, _disconnectAllClients);

                console.log(_rule_id_by_socket_id)
                return response({ status: "success" });
            }
            catch (err) {
                if (err instanceof ExceededStreamRulesCap) { return response({ error: "Limite di connessioni raggiunto" }) }
                if (err instanceof StreamUnavailable) { return response({ error: "Non è stato possibile stabilire una connessione" }) }
                return response({ error: "Si è verificato un errore" })
            }
        });

        socket.on("disconnect", () => {
            console.log(`Disconnecting ${socket.id}`);
            _disconnectClient(socket);
        })
    }
    catch (err) {
        console.log(err)
    }
}


let _sockets_by_rule_id = {};       // Mappa rule_id alla lista dei socket associati
let _rule_id_by_socket_id = {};     // Mappa socket_id al rule_id associato

function _getSocketsForRule(rule_id) { return _sockets_by_rule_id[rule_id] ?? []; }

/* Gestisce la registrazione di una nuova connessione */
function _addConnection(socket, rule_id) {
    if (!(rule_id in _sockets_by_rule_id)) { _sockets_by_rule_id[rule_id] = []; }
    _sockets_by_rule_id[rule_id].push(socket);

    _rule_id_by_socket_id[socket.id] = rule_id;
}

/* Inoltra i tweet ai cliente interessati */
function _forwardTweetToClient(tweet, rules_id) {
    console.log(tweet)
    for (const rule_id of rules_id) {
        _getSocketsForRule(rule_id).forEach((socket) => {
            socket.emit("tweet.stream.new", tweet);
        })
    }
}

/* Gestisce la disconnessione di un client */
function _disconnectClient(disconnected_socket) {
    console.log(`Disconnecting ${disconnected_socket.id}`);
    const to_update_rule_id = _rule_id_by_socket_id[disconnected_socket.id];
    
    if (to_update_rule_id && _sockets_by_rule_id[to_update_rule_id]) {
        // Rimuove l'associazione rule_id -> socket
        _sockets_by_rule_id[to_update_rule_id] = _sockets_by_rule_id[to_update_rule_id].filter((socket) => socket.id != disconnected_socket.id);
        if (_sockets_by_rule_id[to_update_rule_id].length === 0) { delete _sockets_by_rule_id[to_update_rule_id]; }
    }
    // Rimuove l'associazione socket_id -> rule_id
    delete _rule_id_by_socket_id[disconnected_socket.id];

    _handleRuleTimeout(to_update_rule_id);
    _handleStreamTimeout();
}

/* Gestisce la disconnessione di tutti i client */
function _disconnectAllClients() {
    console.log("Disconnecting all");
    for (const sockets of Object.values(_sockets_by_rule_id)) {
        sockets.forEach((socket) => _disconnectClient(socket));
    }
}


let _delete_request_by_rule_id = {};    // Mappa rule_id alla richiesta di eliminazione della regola

/* Gestisce l'avvio della cancellazione di una regola (se necessario) */
function _handleRuleTimeout(rule_id) {
    if (_getSocketsForRule(rule_id).length === 0) {
            console.log(`Start deleting rule ${rule_id}`);
            _abortRuleTimeout(rule_id);

        _delete_request_by_rule_id[rule_id] = setTimeout(async () => {
            await TweetStream.deleteRule(rule_id).catch((err) => { console.error(`Non è stato possibile eliminare la rule ${rule_id}`); });
            console.log(`Rule ${rule_id} deleted`);
        }, EMPTY_RULE_TIMEOUT);
    }
}

/* Annulla la richiesta di cancellazione per una regola */
function _abortRuleTimeout(rule_id) {
    if (_delete_request_by_rule_id[rule_id]) { 
        clearTimeout(_delete_request_by_rule_id[rule_id]);
        console.log(`Abort delete ${rule_id}`);
    }
}


let _close_stream_request = null;

/* Avvia la richiesta di chiusura dello stream */
function _handleStreamTimeout() {
    if (Object.keys(_sockets_by_rule_id).length === 0) { // Nessuna connessione attiva
        console.log(`Start closing stream`);
        _abortStreamTimeout();

        _close_stream_request = setTimeout(() => {
            TweetStream.closeStream();
            _sockets_by_rule_id = {}
            _rule_id_by_socket_id = {}
            console.log(`Stream closed`);
        }, CLOSE_STREAM_TIMEOUT);
    }
}

/* Annulla la richiesta di chiusura dello stream */
function _abortStreamTimeout() {
    if (_close_stream_request) { 
        clearTimeout(_close_stream_request); 
        console.log(`Abort close stream`);
    }
}