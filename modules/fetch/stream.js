require("dotenv").config();
const axios = require("axios");
const ExceededStreamRulesCap = require("./errors/ExceededStreamRulesCap.js");
const StreamUnavailable = require("./errors/StreamUnavailable.js");
const { _normalizeQuery } = require("./utils/normalizeQuery.js");
const { _placeHandler } = require("./utils/placeHandler.js");
const { _mediaHandler } = require("./utils/mediaHandler.js");


const MAX_CONNECTION_RETRY = 3;

let tweet_stream = null;                        // Connessione attualmente attiva
const abort_controller = new AbortController(); // Serve per interrompere la connessione

/**
 * Funzione richiamata alla ricezione di un nuovo tweet
 * @callback onTweet
 * @param {Object} tweet        Dati del tweet
 * @param {string[]} rules_id   Lista degli id delle regole soddisfatte
 */
/**
 * Funzione richiamata alla disconnessione della connessione
 * @callback onDisconnect
 */
/**
 * Si connette allo stream dei tweet in tempo reale
 * @param {onTweet} onTweet                 Funzione richiamata alla ricezione di un nuovo tweet (tweet, rules_id):void
 * @param {onDisconnect} onDisconnect       Funzione richiamata alla chiusura della connessione ():void
 */
async function connectToStream(onTweet, onDisconnect) {
    if (tweet_stream) { return; } // Già connesso allo stream

    tweet_stream = await _getStream();

    tweet_stream.on("data", data => {
        if (data.toString() === "\r\n") { return; } // Segnale keep alive (da ignorare)

        const stream_tweet = JSON.parse(data.toString())
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
            "location": tweet_data.geo ? _placeHandler(stream_tweet.includes.places, tweet_data) : undefined,
            "media": tweet_data.attachments ? _mediaHandler(stream_tweet.includes.media, tweet_data) : undefined
        };

        onTweet(tweet, applied_rules_id);
    });

    tweet_stream.on("error", (err) => {
        tweet_stream = null;

        if (err.code === "ERR_CANCELED") { return onDisconnect(); }
        connectToStream(onTweet, onDisconnect).catch(() => { onDisconnect(); });
    });

    console.log("A")
    await new Promise(r => setTimeout(r, 30000));
    abort_controller.abort()
}

/**
 * Crea una connessione allo stream per i tweet in tempo reale
 * @param {number} reconnect_attemps    Numero di tentativi di riconnessione effettuati
 * @returns {Promise<Object>} Connessione allo stream
 */
async function _getStream(reconnect_attemps=0) {
    if (reconnect_attemps >= MAX_CONNECTION_RETRY) { throw new StreamUnavailable(); }

    try {
        const res = await axios({
            method: "GET", url: "https://api.twitter.com/2/tweets/search/stream",
            headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
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
        return _getStream(reconnect_attemps++);
    }
}


/**
 * Aggiunge una nuova regola per lo stream
 * @param {string} username     Nome utente da filtrare
 * @param {string} keyword      Parola chiave da filtrare
 * @throws {ExceededStreamRulesCap}     Se non è possibile inserire la regola a causa del limit cap di Twitter
 */
async function _addRule(username="", keyword="") {
    if (!username && !keyword) { throw new Error("Parametri mancanti"); }

    const rule = _createRuleString(username, keyword);

    try {
        // Creazione della regola
        await axios({
            method: "POST", url: "https://api.twitter.com/2/tweets/search/stream/rules",
            headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
            data: {
                add: [{ value: rule }]
            }
        });
    }
    catch (err) {
        if (err.response.data.title === "RulesCapExceeded") { throw new ExceededStreamRulesCap(); }
        throw err;
    }
}


/**
 * Restituisce le regola attualmente attive (in ordine cronologico)
 * @returns {Promise<[{id:string, value:string}]>} Vettore delle regole attualmente attive. id è l'identificativo della regola, value il valore della regola
 */
async function _getRules() {
    const res = await axios({
        method: "GET", url: "https://api.twitter.com/2/tweets/search/stream/rules",
        headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
    });

    return res.data.data;
}

/**
 * Gestisce la cancellazione di una regola dato il suo id
 * @param {string} rule_id      Id della regola da cancellare
 */
async function deleteRuleById(rule_id) {
    await axios({
        method: "POST", url: "https://api.twitter.com/2/tweets/search/stream/rules",
        headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        data: {
            delete: { ids: [rule_id] }
        }
    });
}

/**
 * Restituisce l'id di una data regola, se esiste
 * @param {string} username     Nome utente della regola
 * @param {string} keyword      Parola chiave della regola
 * @returns {Promise<string>}   Id della regola, se esiste. undefined altrimenti
 */
async function _getRuleId(username, keyword) {
    const rules = await _getRules();
    const rule_value = _createRuleString(username, keyword);

    const found_rule = rules.find((rule) => rule.value === rule_value);

    return found_rule?.id;
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