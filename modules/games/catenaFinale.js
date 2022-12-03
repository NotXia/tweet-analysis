const { getTweetsByKeyword } = require("../fetch/keyword.js");
const moment = require("moment");

module.exports = {
    catenaFinale: catenaFinale
};

/**
 * Funzione gestore per i tweet per reazione a catena.
 * Se la data è oggi, vengono restituiti i tweet dei partecipanti che hanno provato fino al momento della richiesta.
 * Se è nel passato, vengono restituiti tutti i tweet dei partecipanti della data richiesta.
 * Errore altrimenti.
 * @param {String} date la data richiesta
 * @return Una pagina contenente i tweet inerenti
 */
async function catenaFinale(date) {
    let fetchedTweets = [];
    
    const today = moment().utc().startOf("day");
    const testdate = moment(date).utc().startOf("day");

    if(testdate <= today) {
        fetchedTweets = await _catenaFinaleTweetsFetcher(date);
    }
    else {
        throw new Error("Data nel futuro");
    }

    return fetchedTweets;
}

/**
 * Funzione che recupera i tweet di coloro che hanno provato ad indovinare la catena finale di una determinata data nel passato.
 * @param {String} date data dove si vogliono recuperare i tweet
 * @return {Promise<[{tweet:Object, word:string}]>} I tweet recuperati
 */
async function _catenaFinaleTweetsFetcher(date) {
    let start_date = moment(date).utc().startOf("day").toISOString();
    let end_date = moment(date).utc().endOf("day").toISOString();
    
    const isToday = (moment().utc().startOf("day").toISOString() === moment(date).utc().startOf("day").toISOString());
    let pagination_token = "";
    let out = [];
    do {            //Recupera tutti i tweet contenenti "#leredita" per la data indicata
        try {
            let currentFetch;

            if(isToday) 
                currentFetch = await getTweetsByKeyword("#reazioneacatena", pagination_token, 100, start_date);
            else 
                currentFetch = await getTweetsByKeyword("#reazioneacatena", pagination_token, 100, start_date, end_date);
            
            for(const tweet of currentFetch.tweets) {                     //Per tutti i tweet ricevuti controlla se sono qualificabili al gioco
                if(_isEligible(tweet.text)) {                             //Se il tweet è qualificabile viene immesso nell'array di output
                    tweet.text = _normalizeText(tweet.text);
                    const phrase = tweet.text.split(" ");
                    out.push({
                        tweet: tweet,
                        word: (phrase[0] === "#reazioneacatena" ? phrase[1].replace(/[!?@#$%^&*]/g, "") : phrase[0].replace(/[!?@#$%^&*]/g, ""))
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
 * Controlla se il testo del tweet corrisponde al formato corretto per partecipare
 * Un tweet è qualificato se contiene:
 * - "#reazioneacatena" e la parola con cui si tenta di indovinare
 * @param {String} text testo da controllare
 * @returns {boolean} true se il testo soddisfa i requisiti, false altrimenti
 */
function _isEligible(text) {
    let tmp_text = _normalizeText(text).split(" ");
    return tmp_text.length === 2 && (tmp_text[0] === "#reazioneacatena" || tmp_text[1] === "#reazioneacatena");
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
