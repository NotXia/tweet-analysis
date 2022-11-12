require("dotenv").config();
const axios = require("axios");
const ExceededStreamRulesCap = require("./errors/ExceededStreamRulesCap.js");
const { _normalizeQuery: normalizeQuery } = require("./utils/normalizeQuery.js")


async function connectToStream() {
    const res = await axios({
        method: "GET", url: "https://api.twitter.com/2/tweets/search/stream",
        headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        responseType: "stream"
    });

    const stream = res.data;

    stream.on("data", data => {
        console.log(data.toString());
    });

    stream.on("end", () => {
        console.log("stream done");
    });
}


/**
 * Aggiunge una nuova regola per lo stream
 * @param {string} username     Nome utente da filtrare
 * @param {string} keyword      Parola chiave da filtrare
 * @throws {ExceededStreamRulesCap}     Se non è possibile inserire la regola a causa del limit cap di Twitter
 */
async function addRule(username="", keyword="") {
    if (!username && !keyword) { throw new Error("Parametri mancanti"); }

    const rule = _createRuleString(username, keyword);

    try {
        // Creazione della regola
        const res = await axios({
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
    if (username)   { rule = `${rule} from:${normalizeQuery(username)}`; }
    if (keyword)    { rule = `${rule} ${keyword}`; }
    rule = `${rule} -is:retweet -is:reply`;

    return rule.trim();
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