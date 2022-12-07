const { getTweetsByUser } = require("../fetch/user.js");
const PoliticanModel = require("../../models/Politicians.js");
const moment = require('moment');
const mongoose = require("mongoose");

module.exports = { getPointsByWeek: getPointsByWeek }

async function getPointsByWeek(date) {
    let start_date = moment(date).utc().startOf("week");
    let end_date = moment(date).utc().endOf("week");

    if (end_date > moment().utc()) {
        end_date = moment().utc();
    }

    try {
        const tweets = await getTweetsByUser("Fanta_citorio", "", 500, start_date.toISOString(), end_date.toISOString());
        for (const tweet of tweets.tweets) {
            let points = await _parsePoints(tweet.text);
        }
    } catch (err) {
        throw new Error("Tweet non trovati");
    }
}

async function _parsePoints(text) {
    let points = {};
    text = _removeStopWords(text);
    let words = text.split(" ");
    let isMalus = false;
    
    let pointsBuffer = null;
    let politiciansBuffer = [];

    let i = 0;
    while (i < words.length) {
        const word = words[i];
        if (_isNumber(word)) {                  // Se è un numero
            pointsBuffer = parseInt(word);
            i++;
        } else {                                // Altrimenti
            let nextNames = _getSubstring(words, i);
            const nextNames_size = nextNames.length;
            politiciansBuffer = politiciansBuffer.concat(await _getPoliticians(nextNames));
            i += nextNames_size;
        }

        if (pointsBuffer && politiciansBuffer.length > 0) {
            for (const politician of politiciansBuffer) {
                if (!points[politician]) { points[politician] = 0; }
                points[politician] += pointsBuffer;
            }
            pointsBuffer = null;
            politiciansBuffer = [];
        }
    }

    return points;
}

// TODO: Gestire somma di punti, malus e O al posto di 0
function _removeStopWords(text) {
    text = text.toLowerCase().trim();
    text = text.replace(/([-,:]|\b(per|punti|a|altri)\b)+/g, " ");
    text = text.replace(/\n/g, " ");
    text = text.replace(/\s\s+/g, " ");

    return text;
}

function _isNumber(text) { return (/\d+/).test(text); }

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

mongoose.connect(process.env.MONGO_URL);
getPointsByWeek("2022-12-01T12:00:01.123Z").then((res) => {console.log(res)})