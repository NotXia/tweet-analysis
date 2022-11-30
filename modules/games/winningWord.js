const { getTweetsByKeyword } = require("../fetch/keyword.js");
const moment = require('moment');

module.exports = { getWinningWord: getWinningWord }

/**
 * Restituisce la parola vincente del gioco scelto per il giorno scelto.
 * @param {string} date         Giorno scelto
 * @param {string} search       Frase da ricercare per il gioco scelto
 * @param {string} from         Username account twitter che pubblica la risposta
 * @returns {Promise<Object>}   Parola del giorno indicato e data relativa
 */
async function getWinningWord(date=moment().format(), search="La #parola della #ghigliottina de #leredita di oggi è:", from="quizzettone") {
    search = search.replace(/\s\s+/g, " ");
    const query = `from:${from} "${search}"`;

    try {
        const word = await getTweetsByKeyword(query, "", 10, moment(date).utc().startOf("day"), moment(date).utc().endOf("day"));

        let tweetText = word.tweets[0].text.replace(/(\r\n|\n|\r)/gm, " ");           // Viene modificata la stringa togliendo gli "a capo"
        tweetText = tweetText.replace(/\s\s+/g, " ");                                 // Vengono collassati tutti gli spazi in uno solo

        let result = {}
        result.word = tweetText.match(new RegExp(`${search}\\s(\\w+)`))[1];          // Ricerca parola vincente
        result.date = word.tweets[0].time;

        return result;
    } catch (err) {
        throw new Error("Tweet non trovato");
    }

}
