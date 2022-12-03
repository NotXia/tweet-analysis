const { getTweetsByKeyword } = require("../fetch/keyword.js");
const moment = require("moment");

module.exports = {
    ghigliottina: ghigliottina,
    catenaFinale: catenaFinale
};

/**
 * Funzione gestore per i tweet della ghigliottina.
 * Se la data è oggi, vengono restituiti i tweet dei partecipanti che hanno provato fino al momento della richiesta.
 * Se è nel passato, vengono restituiti tutti i tweet dei partecipanti della data richiesta.
 * Errore altrimenti.
 * @param {String} date la data richiesta
 * @return Una pagina contenente i tweet inerenti
 */
async function ghigliottina(date) {
    return _getUserAttempts(date, "#leredita");
}

/**
 * Funzione gestore per i tweet per reazione a catena.
 * Se la data è oggi, vengono restituiti i tweet dei partecipanti che hanno provato fino al momento della richiesta.
 * Se è nel passato, vengono restituiti tutti i tweet dei partecipanti della data richiesta.
 * Errore altrimenti.
 * @param {String} date la data richiesta
 * @return Una pagina contenente i tweet inerenti
 */
async function catenaFinale(date) {
    return _getUserAttempts(date, "#reazioneacatena");
}


/**
 * Restituisce i tweet di chi prova a indovinare un dato gioco
 * @param {String} date     Data dei tentativi (formato ISO)
 * @param {String} query    Query da usare per individuare i tentativi
 * @returns {Promise<[{tweet:Object, word:string}]>} Tweet di chi prova a indovinare
 */
 async function _getUserAttempts(date, query) {
    let fetchedTweets = [];
    
    const today = moment().utc().startOf("day");
    const testdate = moment(date).utc().startOf("day");

    if(testdate <= today) {
        fetchedTweets = await _tweetsFetcher(date, query);
    }
    else {
        throw new Error("Data nel futuro");
    }

    return fetchedTweets;
}


/**
 * Funzione che recupera i tweet di coloro che hanno provato ad indovinare la ghigliottina di una determinata data nel passato.
 * @param {String} date data dove si vogliono recuperare i tweet
 * @return {Promise<[{tweet:Object, word:string}]>} I tweet recuperati
 */
async function _tweetsFetcher(date, query) {
    let start_date = moment(date).utc().startOf("day").toISOString();
    let end_date = moment(date).utc().endOf("day").toISOString();
    
    const isToday = (moment().utc().startOf("day").toISOString() === moment(date).utc().startOf("day").toISOString());
    let pagination_token = "";
    let out = [];
    do {            //Recupera tutti i tweet contenenti "#leredita" per la data indicata
        try {
            let currentFetch;

            if(isToday) 
                currentFetch = await getTweetsByKeyword(query, pagination_token, 100, start_date);
            else 
                currentFetch = await getTweetsByKeyword(query, pagination_token, 100, start_date, end_date);
            
            for(const tweet of currentFetch.tweets) {                     //Per tutti i tweet ricevuti controlla se sono qualificabili al gioco
                if(_isEligible(tweet.text, query)) {                             //Se il tweet è qualificabile viene immesso nell'array di output
                    tweet.text = _normalizeText(tweet.text);
                    const phrase = tweet.text.split(" ");
                    out.push({
                        tweet: tweet,
                        word: (phrase[0] === query ? phrase[1] : phrase[0]).replace(/[!?@#$%^&*]/g, "")
                    });
                }
            }

            pagination_token = currentFetch.next_token;
        }catch(err){
            console.log(err);
            break;
        }
    }while(pagination_token !== "");

    return out;
}

/**
 * Controlla se il testo del tweet corrisponde al formato corretto per partecipare alla ghigliottina
 * Un tweet è qualificato se contiene:
 * - "#leredita" e la parola con cui si tenta di indovinare
 * @param {String} text testo da controllare
 * @returns {boolean} true se il testo soddisfa i requisiti, false altrimenti
 */
function _isEligible(text, query) {
    let tmp_text = _normalizeText(text).split(" ");
    return tmp_text.length === 2 && (tmp_text[0] === query || tmp_text[1] === query);
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