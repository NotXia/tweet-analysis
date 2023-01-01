const { getTweetsByUser } = require("../fetch/user.js");
const { getTweetsByKeyword } = require("../fetch/keyword.js");
const { _normalizeQuery } = require("../fetch/utils/normalizeQuery");
const PoliticanModel = require("../../models/Politicians.js");
const FantacitorioModel = require("../../models/Fantacitorio.js");
const moment = require('moment');
const Jimp = require('jimp');

module.exports = { 
    getSquads: getSquads,
    getPointsByWeek: getPointsByWeek,
    getRanking: getRanking,
    updateScoreOfPolitician: updateScoreOfPolitician,
    getRankingStatistics: getRankingStatistics,

    testing : {
        parsePoints: _parsePoints
    }
}

/**
 * Genera la classifica dei punteggi dei politici complessiva.
 * @params {string} date            Data della settimana in cui considerare la fine della classifica (formato ISO)
 * @returns {Promise<Object>}       Classifica dei punteggi dei politici in ordine crescente.
 */
async function getRanking(date=undefined) {
    try {
        let totalPoints = {};
        let points = await FantacitorioModel.find({});
        if (!points) { return []; }
        if (date) { points = points.filter((score) => moment(score.date).isSameOrBefore(date)); } // Esclude i giorni successivi alla data selezionata

        for(const batch of points) {
            for(const row of batch.points) {
                if (!totalPoints[row.politician]) {
                    totalPoints[row.politician] = 0;
                }
                totalPoints[row.politician] += row.points;
            }
        }

        let sortedRanking = Object.keys(totalPoints).map((politician) => ({ politician: politician, points: totalPoints[politician] }));
        sortedRanking.sort((p1, p2) => p2.points - p1.points);

        return sortedRanking;
    } catch (err) {
        return null;
    }
}

/**
 * Funzione che recupera i giocatori che si sono registrati al fantacitorio, insieme alla propria squadra
 * @param {String} pagination_token Pagination token della pagina di immagini da visualizzare
 * @param {String} username         Nome utente di cui ricercare la squadra, se si vuole cercare di un utente specifico (facoltativo)
 * @return {Promise<tweets:[{tweet:Object, squad:string}], next_token:string>} I tweet recuperati con il relativo link all'immagine con la propria squadra e token per la prossima pagina
 */
async function getSquads(pagination_token = "", username = undefined) {
    // Immagine di riferimento che verrà comparata con quelle nei tweet, per verificare quali immagini sono effettivamente squadre per il fantacitorio
    const img_sample = await Jimp.read('https://pbs.twimg.com/media/FgJ1OUDWQAEn9JT?format=jpg&name=medium');
    let query = "#fantacitorio";
    if (username) { 
        username = _normalizeQuery(username);
        query = `from:${username} #fantacitorio`; 
    }

    try {
        let currentFetch;
        let out = {
            tweets: []
        };
        let tries = 0;
        do {
            currentFetch = await getTweetsByKeyword(query, pagination_token, 10, '2006-03-26T00:00:02Z', '', true);

            for(const tweet of currentFetch.tweets) { 
                // Se nel tweet ci sono dei media, controlla se nei media c'è una squadra e la aggiunge alle squadre
                if (tweet.media.length > 0) { 
                    out.tweets = await _addSquad(tweet, out.tweets, img_sample); 
                    tries++;
                }
            }
            pagination_token = currentFetch.next_token;

        // Se nella pagina di tweet richiesta non è stata trovata nessuna squadra e ci sono altri tweet disponibili, passa alla prossima
        // Se invece si sta ricercando per nome utente, anche se sono state trovate squadre continua a cercare finchè non ha processato 20 tweet con media e #fantacitorio,
        // per cercare il più possibile la prima squadra pubblicata 
        } while((out.tweets.length == 0 && pagination_token !== "") || (username && tries < 20 && pagination_token !== "")); 

        if (!username) { out.next_token = currentFetch.next_token; }
        return out;
    }catch(err){
        throw new Error("Parametri errati o errore nel recuperare le squadre");
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
 * Sovrascrive il punteggio di un politico di una data settimana
 * @param {string} politician_name      Nome del politico
 * @param {number} new_score            Punteggio da inserire
 * @param {string} date                 Giorno della settimana di riferimenti (formato ISO)
 */
async function updateScoreOfPolitician(politician_name, new_score, date) {
    let curr_points = await FantacitorioModel.getPointsOfWeek(date); // Estrae punteggio attuale
    if (!curr_points) { curr_points = {}; }
    const politician = await PoliticanModel.get(politician_name);
    if (!politician) { return; }

    curr_points[politician] = new_score;

    await FantacitorioModel.cachePoints(curr_points, date); // Aggiorna il punteggio
}


/**
 * Funzione che controlla se nei media di un tweet è presente una squadra, e se si la aggiunge alle squadre
 * @param {Object} tweet        Tweet da controllare
 * @param {Object[]} squads     Array di squadre a cui eventualmente aggiungere quella trovata
 * @param {Buffer} img_sample   Immagine di riferimento con il template di una squadra a cui paragonare i media del tweet
 * @return {Promise<[{tweet:Object, squad:string}]>} L'array delle squadre con eventualmente aggiunta quella trovata
 */
async function _addSquad(tweet, squads, img_sample) {
    for (const md of tweet.media) {
        if (await _isSquad(md, img_sample)) {  
            squads.push({
                tweet: tweet,
                squad: md.url
            });
        }   
    }

    return squads;
}

/**
 * Funzione che controlla se un media è una squadra
 * @param {Object} media        Media da controllare
 * @param {Buffer} img_sample   Immagine di riferimento con il template di una squadra a cui paragonare i media del tweet
 * @return {Boolean} true se l'immagine è una squadra, false altrimenti
 */
async function _isSquad(media, img_sample) {
    if (media.type === 'photo') {
        let img = await Jimp.read(media.url);
        img.autocrop(false);   //Rimuove eventuali bordi esterni nell'immagine

        // Restituisce true se l'immagine è estremamente simile all'immagine di riferimento
        return Jimp.distance(img, img_sample) <= 0.01;
    }
    return false;
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
 * @param {String[]} names          Array di possibili nomi di politici
 * @returns {Promise<String[]>}     Array di nomi di politici riconosciuti
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


/**
 * Calcola statistiche sulla classifica del Fantacitorio
 * @returns {Promise<{best_single_score:Object, best_average:Object, best_climber:Object}>} Statistiche della classifica
 */
async function getRankingStatistics() {
    let allScores = await FantacitorioModel.find({});
    allScores.sort((s1, s2) => moment(s2.date).diff(s1.date));

    return {
        best_single_score: _bestSingleScore(allScores),
        best_average: _bestAverage(allScores),
        best_climber: await _bestClimber(allScores)
    };
}

/**
 * Calcola il best single score: il politico che in una settimana ha guadagnato il maggior numero di punti
 * @param {{points: [{politician:string, points:number}, date:string]}} scores  Punteggi settimanali
 * @returns {politician:string, points:number} Il politico best single score
 */
function _bestSingleScore(scores) {
    let best_single_score = { politician: "", points: Number.MIN_VALUE };

    // Calcolo best single score
    for (const week_score of scores) {
        week_score.points.forEach((score) => {
            if (score.points > best_single_score.points) {
                best_single_score.politician = score.politician;
                best_single_score.points = score.points;
            }
        });
    }

    return best_single_score;
}

/**
 * Calcola il best average: il politico che ha la media dei punti maggiore
 * @param {{points: [{politician:string, points:number}, date:string]}} scores  Punteggi settimanali
 * @returns {politician:string, points:number} Il politico best average
 */
function _bestAverage(scores) {
    let best_average = { politician: "", points: Number.MIN_VALUE };
    let politicians_scores = {}; // Tracciare per ogni politico la somma dei punti e il numero di volte in cui compare

    // Calcolo somma punti e numero apparizioni per politico
    for (const week_score of scores) {
        week_score.points.forEach((score) => {
            if (!politicians_scores[score.politician]) { politicians_scores[score.politician] = { points: 0, times: 0 }; }
            politicians_scores[score.politician].points += score.points;
            politicians_scores[score.politician].times++;
        });
    }

    // Calcolo best average
    Object.keys(politicians_scores).forEach((politician) => {
        let average = politicians_scores[politician].points / politicians_scores[politician].times;
        if (average > best_average.points) {
            best_average.politician = politician;
            best_average.points = average;
        }
    })

    return best_average;
}

/**
 * Calcola il best climber: il politico che tra questa settimana e la precedente ha scalato il numero maggiore di posizioni
 * @param {{points: [{politician:string, points:number}, date:string]}} scores  Punteggi settimanali
 * @returns {politician:string, points:number|null} Il politico best climber
 */
async function _bestClimber(scores) {
    let best_climber = { politician: "", rank: Number.MIN_VALUE };

    // Calcolo delle settimane di riferimento
    let i = 0;
    while (scores[i].points.length === 0) { i++; } // Cerca la prima settimana disponibile con dei punteggi
    const rank_reference_date = scores[i].date;
    i++;
    while (scores[i].points.length === 0) { i++; } // Cerca la seconda settimana disponibile con dei punteggi
    const rank_previous_date = scores[i].date;

    // Calcolo delle posizioni
    let ranking_reference = await getRanking(rank_reference_date);
    let ranking_previous = await getRanking(rank_previous_date);
    ranking_reference = ranking_reference.map((score, index) => ({ politician: score.politician, rank: index+1 }));
    ranking_previous = ranking_previous.map((score, index) => ({ politician: score.politician, rank: index+1 }));

    // Calcolo best climber
    ranking_reference.forEach((score) => {
        let previous_rank = ranking_previous.find((prev_score) => prev_score.politician === score.politician)?.rank ?? ranking_previous.length;
        let diff = previous_rank - score.rank;

        if (diff > best_climber.rank) {
            best_climber.politician = score.politician;
            best_climber.rank = diff;
        }
    });
    
    if (best_climber.politician === "") { return null; } // Classifica rimasta invariata

    return best_climber;
}