const { getTweetsByUser } = require("../fetch/user.js");
const { getTweetsByKeyword } = require("../fetch/keyword.js");
const PoliticanModel = require("../../models/Politicians.js");
const moment = require('moment');
const Jimp = require('jimp');

module.exports = { 
    getSquads: getSquads,
    getPointsByWeek: getPointsByWeek,

    testing : {
        parsePoints: _parsePoints
    }
}

/**
 * Funzione che recupera i giocatori che si sono registrati al fantacitorio, insieme alla propria squadra
 * @param {String} pagination_token pagination token della pagina di immagini da visualizzare
 * @return {Promise<tweets:[{tweet:Object, squad:string, next_token:string}], next_token:string>} I tweet recuperati con il relativo link all'immagine con la propria squadra e token per la prossima pagina
 */
async function getSquads(pagination_token = "") {
    // Immagine di riferimento che verrà comparata con quelle nei tweet, per verificare quali immagini sono effettivamente squadre per il fantacitorio
    const img_sample = await Jimp.read('https://pbs.twimg.com/media/FgJ1OUDWQAEn9JT?format=jpg&name=medium');

    try {
        let currentFetch;
        let out = {
            tweets: []
        };
        do {
            currentFetch = await getTweetsByKeyword("#fantacitorio", pagination_token, 10, '', '', true);

            for(const tweet of currentFetch.tweets) {
                if (tweet.media.length > 0) {
                    for (const md of tweet.media) {
                        if (md.type === 'photo') {
                            await Jimp.read(md.url)
                                .then(image => {
                                    image.autocrop(false);  //Rimuove eventuali bordi esterni nell'immagine

                                    // Se l'immagine nel tweet e l'immagine di riferimento sono estremamente simili, registra l'immagine come squadra
                                    if (Jimp.distance(image, img_sample) <= 0.01) {    
                                        out.tweets.push({
                                            tweet: tweet,
                                            squad: md.url
                                        });
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }   
                    }
                }
            }
            pagination_token = currentFetch.next_token;
        } while(out.tweets.length == 0 && pagination_token !== "");  // Se nella pagina di tweet richiesta non è stata trovata nessuna squadra e ci sono altri tweet disponibili, passa alla prossima

        out.next_token = currentFetch.next_token;
        return out;
    }catch(err){
        throw new Error("Pagination token errato o errore nel recuperare le squadre");
    }
}

/**
 * Scelta una data, vengono ricercati tutti i punteggi assegnati durante quella settimana e viene restituita un oggetto contenente il complessivo settimanale dei punteggi per ogni politico coinvolto.
 * @param {String} date             Data scelta
 * @returns {Promise<Object>}       Oggetto con politico e punteggio durante la settimana
 */
async function getPointsByWeek(date) {
    let start_date = moment(date).utc().startOf("isoWeek");
    let end_date = moment(date).utc().endOf("isoWeek");

    if (start_date > moment().utc()) { throw new Error("Data nel futuro"); }

    if (end_date > moment().utc()) {
        end_date = moment().subtract(15, "seconds").utc();
    }

    try {
        const tweets = await getTweetsByUser("Fanta_citorio", "", 500, start_date.toISOString(), end_date.toISOString());
        let totalPoints = {};
        for (const tweet of tweets.tweets) {
            let points = await _parsePoints(tweet.text);
            for (const row in points) {
                if (!totalPoints[row]) {
                    totalPoints[row] = 0;
                }
                totalPoints[row] += points[row];
            }
        }
        return totalPoints;
    } catch (err) {
        throw new Error("Tweet non trovati");
    }
}

/**
 * Dato un testo di un tweet con punti e politici, restituisce un oggetto con tutti i punti assegnati a tutti i politici citati.
 * @param {String} text         Testo del tweet
 * @returns {Promise<Object>}   Oggetto con i punti e i politici citati nel testo
 */
async function _parsePoints(text) {
    let points = {};
    text = _normalizeString(text);
    let words = text.split(" ");
    let isMalus = false;
    
    let pointsBuffer = null;
    let politiciansBuffer = [];

    let i = 0;
    while (i < words.length) {
        let word = words[i];
        if (_isNumber(word)) {                      // Se è un numero
            word = word.replaceAll("o", "0");
            pointsBuffer = parseInt(word);
            i++;
        } else if (["malus"].includes(word)){       // Se è un malus
            isMalus = true;
            i++;
        } else {
            let nextNames = _getSubstring(words, i);
            const nextNames_size = nextNames.length;
            politiciansBuffer = politiciansBuffer.concat(await _getPoliticians(nextNames));
            i += nextNames_size;
        }
        
        if (!(pointsBuffer && politiciansBuffer.length > 0)) { continue; }
        politiciansBuffer.forEach((politician) => {
            if (!points[politician]) { points[politician] = 0; }
            if (isMalus) { points[politician] -= pointsBuffer; }
            else { points[politician] += pointsBuffer; }
        })
        pointsBuffer = null;
        politiciansBuffer = [];
        isMalus = false;
    }

    return points;
}

/**
 * Data una stringa, la restituisce normalizzata, rimuovendo eventuali paroli "inutili" e segni di punteggiatura
 * @param {String} text     Testo del tweet
 * @returns {String}        Testo normalizzato
 */
function _normalizeString(text) {
    text = text.toLowerCase().trim();
    text = text.replace(/([-,:()]|\b(per|punti|a|altri|di)\b)+/g, " ");
    text = text.replace(/\n/g, " ");
    text = text.replace(/\s\s+/g, " ");

    return text;
}

/**
 * Verifica se una data stringa è un numero o se inizia per una cifra nel caso il numero abbia (ad esempio) delle "o" al posto di 0
 * @param {String} text     Parola da verificare
 * @returns {Boolean}       True se è un numero, false altrimenti.
 */
function _isNumber(text) { return (/\d(\d|o)+/).test(text); }

/**
 * Dato un array di parole (derivanti dal tweet) e un indice d'inizio, cerca la prima occorrenza numerica e restituisce il sottoarray fino a quel punto
 * @param {String[]} words          Array di parole 
 * @param {Integer} begin_index     Indice di inizio
 * @returns {String[]}              Parte ricercata dell'array di input
 */
function _getSubstring(words, begin_index) {
    let end_index = words.length;

    for (let i = begin_index; i < words.length; i++) {
        const word = words[i];
        if (_isNumber(word)) {
            end_index = i;
            break;
        }
    }

    return words.slice(begin_index, end_index);
}

/**
 * Dato un vettore di possibili nomi di politici, prova a ricercare il politico ricercandone il nome nel database.
 * @param {String[]} names      Array di possibili nomi di politici
 * @returns {String[]}          Array di nomi di politici riconosciuti
 */
async function _getPoliticians(names) {
    /**
     * Dato un vettore di nomi di politici, prova a riconoscere il nome a partire dalla stringa più grande possibile, riducendola man mano partendo dal fondo.
     * Se alla fine non è stato consumato tutto il nome, rimuove il primo elemento e ripete l'algoritmo.
    */
    let found_names = [];
    
    while (names.length > 0) {
        let should_pop = true;

        for (let i = names.length-1; i >= 0; i--) {
            let names_string = names.slice(0, i+1).join(" ");
            const politicianName = await PoliticanModel.get(names_string);
            if (politicianName) {
                names = names.join(" ").replace(names_string, "").replace(/\s\s+/g, " ").split(" ");        // Rimuove dal vettore names le parti del nome del politico riconosciuto
                found_names.push(politicianName);
                should_pop = false;
                break;
            }
        }

        if (should_pop) { names.shift(); }

    }
    
    return found_names;
}
