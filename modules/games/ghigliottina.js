const { getTweetsByKeyword } = require("../fetch/keyword.js");
const moment = require("moment");

module.exports = {
    ghigliottina: ghigliottina
};

/**
 * Funzione gestore per i tweet della ghigliottina.
 * Se la data è oggi, viene avviato lo stream, altrimenti vengono restituiti tutti i tweet dei partecipanti della data richiesta
 * @param {String} date la data richiesta
 * @return Una pagina contenente i tweet inerenti
 */
async function ghigliottina(date) {
    let fetchedTweets = [];
    
    const today = moment().utc().startOf("day").format();
    date = moment(date).utc().startOf("day").format();
    if(date === today) {
        // fetchedTweets = _ghigliottinaLive();
    }
    else if(date < today) {
        fetchedTweets = await _ghigliottinaHistory(date);
    }
    else {
        throw new Error("Data nel futuro");
    }

    return fetchedTweets;
}

/**
 * Funzione che recupera i tweet di coloro che hanno provato ad indovinare la ghigliottina di una determinata data nel passato.
 * @param {String} date data dove si vogliono recuperare i tweet
 * @return I tweet recuperati
 */
async function _ghigliottinaHistory(date) {
    let start_date = moment(date).utc().startOf("day").toISOString();
    let end_date = moment(date).utc().endOf("day").toISOString();
    
    let pagination_token = "";
    let fetchedTweets = [];
    do {
        try {
            let currentFetch = await getTweetsByKeyword("#leredita", pagination_token, 100, start_date, end_date);
            fetchedTweets = fetchedTweets.concat(currentFetch.tweets);
            if(currentFetch.next_token === "") { break; }
            pagination_token = currentFetch.next_token;
        }catch(err){
            console.log(err);
            pagination_token = "";
            break;
        }
    }while(pagination_token !== "");

    let out = [];
    for(const tweet of fetchedTweets) {
        if(_isEligible(tweet.text)) {
            tweet.text = _normalizeText(tweet.text);
            out.push(tweet);
        }
    }
    return out;
}

/**
 * Controlla se il testo del tweet corrisponde al formato corretto per partecipare alla ghigliottina
 * @param {String} text testo da controllare
 * @returns {boolean} true se il testo soddisfa i requisiti, false altrimenti
 */
function _isEligible(text) {
    let out = false;
    let tmp_text = _normalizeText(text).split(" ");
        
        if(tmp_text.length === 2 && (tmp_text[0] === "#leredita" || tmp_text[1] === "#leredita"))
            out = true;

    return out;
}

/**
 * Normalizza la stringa ricevuta
 * @param {string} text 
 * @returns stringa normalizzata
 */
function _normalizeText(text) {
    text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').trim();
    text = text.replace(/(\r\n|\n|\r)/gm, " ");

    return text;
}
