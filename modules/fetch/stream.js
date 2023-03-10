require("dotenv").config();
const axios = require("axios");
const ExceededStreamRulesCap = require("./errors/ExceededStreamRulesCap.js");
const StreamUnavailable = require("./errors/StreamUnavailable.js");
const { _normalizeQuery } = require("./utils/normalizeQuery.js");
const { _placeHandler } = require("./utils/placeHandler.js");
const { _mediaHandler } = require("./utils/mediaHandler.js");


module.exports = {
    openStream: openStream,
    closeStream: closeStream,
    addRule: addRule,
    deleteRule: deleteRuleById
}


const MAX_RECONNECT_ATTEMPTS = 5;

let tweet_stream = null;                        // Connessione attualmente attiva
let abort_controller = new AbortController();   // Serve per interrompere la connessione


/**
 * Si connette allo stream dei tweet in tempo reale
 * @param {(tweet:Object, rule_id:string)=>void} onTweet        Funzione richiamata alla ricezione di un nuovo tweet
 * @param {()=>void} onDisconnect                               Funzione richiamata alla chiusura della connessione
 * @throws {StreamUnavailable} Se non è stato possibile collegarsi allo stream
 */
async function openStream(onTweet, onDisconnect) {
    if (tweet_stream) { return; } // Già connesso allo stream

    tweet_stream = await _getStream();

    // Ricezione dati
    tweet_stream.on("data", data => {
        data = data.toString(); // Conversione da Buffer a stringa
        if (data === "\r\n") { return; } // Segnale keep alive (da ignorare)
        
        let stream_tweet = "";
        // Può capitare di ricevere dati troncati (vengono scartati)
        try { stream_tweet = JSON.parse(data) }
        catch (err) { return; }

        const tweet_data = stream_tweet.data; // Dati del tweet
        const applied_rules_id = stream_tweet.matching_rules.map(rule => rule.id); // Dati delle rules applicate

        const tweet = {
            "id": tweet_data.id,
            "name": stream_tweet.includes.users[0].name,
            "username": stream_tweet.includes.users[0].username,
            "pfp": stream_tweet.includes.users[0].profile_image_url,
            "text": tweet_data.text,
            "time": tweet_data.created_at,
            "likes": tweet_data.public_metrics["like_count"],
            "comments": tweet_data.public_metrics["reply_count"],
            "retweets": tweet_data.public_metrics["retweet_count"],
            "location": Object.keys(tweet_data.geo).length !== 0 ? _placeHandler(stream_tweet.includes.places, tweet_data) : undefined,
            "media": tweet_data.attachments ? _mediaHandler(stream_tweet.includes.media, tweet_data) : []
        };

        onTweet(tweet, applied_rules_id);
    });

    // Connessione in errore (lo stream è infinito, quindi non esiste un modo "soft" di chiudere la connessione)
    tweet_stream.on("error", (err) => {
        tweet_stream = null;

        if (err.code === "ERR_CANCELED") { return onDisconnect(); }         // Disconnessione manuale
        openStream(onTweet, onDisconnect).catch(() => { // Tentativo di riconnessione
            onDisconnect(); // Riconnessione fallita
        }); 
    });
}

/**
 * Crea una connessione allo stream per i tweet in tempo reale
 * @param {number} reconnect_attemps    Numero di tentativi di riconnessione effettuati
 * @throws {StreamUnavailable} Se non è stato possibile collegarsi allo stream
 * @returns {Promise<Object>} Connessione allo stream
 */
async function _getStream(reconnect_attemps=0) {
    if (reconnect_attemps >= MAX_RECONNECT_ATTEMPTS) { throw new StreamUnavailable(); }

    try {
        const res = await axios({
            method: "GET", url: "https://api.twitter.com/2/tweets/search/stream",
            headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN_STANDARD}` },
            params: {
                "expansions": "geo.place_id,author_id,attachments.media_keys",
                "tweet.fields": "created_at,text,public_metrics",
                "place.fields": "country,full_name,geo",
                "media.fields": "url,variants",
                "user.fields": "name,profile_image_url,username"
            },
            responseType: "stream",
            timeout: 30000,                 // Nota: deve essere almeno di 10 secondi (cadenza del keep alive)
            signal: abort_controller.signal // Per chiudere la connessione manualmente quando necessario
        });

        return res.data;
    }
    catch (err) {
        await new Promise(r => setTimeout(r, 2**reconnect_attemps * 2000)); // Delay con incremento quadratico sul numero di tentativi di riconnessione
        return _getStream(reconnect_attemps+1);
    }
}


/**
 * Chiude la connessione allo stream (Interrompe la ricezione di TUTTI i tweet per tutte le regole)
 */
function closeStream() {
    abort_controller.abort();

    abort_controller = new AbortController();
    tweet_stream = null;

    // Pulizia regole ancora attive
    _getRules().then((rules) => {
        rules?.forEach((rule) => deleteRuleById(rule.id));
    }).catch ((err) => { console.error("Non è stato possibile ripulire le regole"); });
}



/**
 * Aggiunge una nuova regola per lo stream
 * @param {string} username     Nome utente da filtrare
 * @param {string} keyword      Parola chiave da filtrare
 * @throws {ExceededStreamRulesCap}     Se non è possibile inserire la regola a causa del limit cap di Twitter
 * @returns {Promise<string>} Id della regola creata
 */
async function addRule(username="", keyword="") {
    if (!username && !keyword) { throw new Error("Parametri mancanti"); }

    const rule = _createRuleString(username, keyword);

    try {
        // Creazione della regola
        const res = await axios({
            method: "POST", url: "https://api.twitter.com/2/tweets/search/stream/rules",
            headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN_STANDARD}` },
            data: {
                add: [{ value: rule }]
            }
        });

        if (res.data.data) { // Regola creata correttamente
            return res.data.data[0].id; 
        } 
        else if (res.data.errors && res.data.errors[0].title === "DuplicateRule") { // Regola già esistente
            return res.data.errors[0].id;
        }
        else {
            throw new Error();
        }
    }
    catch (err) {
        if (err.response.data.title === "RulesCapExceeded") { throw new ExceededStreamRulesCap(); }
        throw err;
    }
}


/**
 * Gestisce la cancellazione di una regola dato il suo id
 * @param {string} rule_id      Id della regola da cancellare
 */
async function deleteRuleById(rule_id) {
    await axios({
        method: "POST", url: "https://api.twitter.com/2/tweets/search/stream/rules",
        headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN_STANDARD}` },
        data: {
            delete: { ids: [rule_id] }
        }
    });
}


/**
 * Restituisce le regola attualmente attive
 * @returns {Object[]} Lista delle regole
 */
async function _getRules() {
    const res = await axios({
        method: "GET", url: "https://api.twitter.com/2/tweets/search/stream/rules",
        headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN_STANDARD}` },
    });

    return res.data.data;
}


/**
 * Compone la regola per uno stream
 * @param {string} username     Username da filtrare con la regola
 * @param {string} keyword      Parola chiave da filtrare con la regola
 * @returns {string} Regola composta
 */
function _createRuleString(username="", keyword="") {
    let rule = "";
    
    // Composizione della regola
    if (username)   { rule = `${rule} from:${_normalizeQuery(username)}`; }
    if (keyword)    { rule = `${rule} ${keyword}`; }
    rule = `${rule} -is:retweet -is:reply`;

    return rule.trim();
}
