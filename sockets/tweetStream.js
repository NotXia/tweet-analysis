const TweetStream = require("../modules/fetch/stream.js");
const ExceededStreamRulesCap = require("../modules/fetch/errors/ExceededStreamRulesCap.js");


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
                _addConnection(socket, rule_id);
                TweetStream.openStream(_forwardTweetToClient, _disconnectAllClients);
            }
            catch (err) {
                if (err instanceof ExceededStreamRulesCap) { return response({ error: "Limite di connessioni raggiunto" }) }
                return response({ error: "Non è possibile stabilire la connessione" })
            }
        });

        socket.on("disconnect", () => {
            _disconnectClient(socket);
        })
    }
    catch (err) {
        console.log(err)
    }
}


let _sockets_by_rule_id = {};       // Mappa rule_id alla lista dei socket associati
let _rule_id_by_socket_id = {};     // Mappa socket_id al rule_id associato

/* Gestisce la registrazione di una nuova connessione */
function _addConnection(socket, rule_id) {
    if (!(rule_id in _sockets_by_rule_id)) { _sockets_by_rule_id[rule_id] = []; }
    _sockets_by_rule_id[rule_id].push(socket);

    _rule_id_by_socket_id[socket.id] = rule_id;
}

/* Inoltra i tweet ai cliente interessati */
function _forwardTweetToClient(tweet, rules_id) {
    for (const rule_id of rules_id) {
        _sockets_by_rule_id[rule_id].forEach((socket) => {
            socket.emit("tweet.stream.new", tweet);
        })
    }
}

/* Gestisce la disconnessione di un client */
function _disconnectClient(disconnected_socket) {
    const to_update_rule_id = _rule_id_by_socket_id[disconnected_socket.id];
    _sockets_by_rule_id[to_update_rule_id] = _sockets_by_rule_id[to_update_rule_id].filter((socket) => socket.id != disconnected_socket.id);

    delete _rule_id_by_socket_id[disconnected_socket.id];
}

/* Gestisce la disconnessione di tutti i client */
function _disconnectAllClients() {
    for (const sockets of Object.values(_sockets_by_rule_id)) {
        sockets.forEach((socket) => _disconnectClient(socket));
    }
}