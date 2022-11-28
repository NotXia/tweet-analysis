const { getTweetsByKeyword } = require("../fetch/keyword.js");
const moment = require('moment');

module.exports = { getWinningWord: getWinningWord }

/**
 * Restituisce la parola vincente del gioco scelto per il giorno scelto.
 * @param {string} date         Giorno scelto
 * @param {string} search       Frase da ricercare per il gioco scelto
 * @param {string} from         Username account twitter che pubblica la risposta
 * @returns {Promise<string>}   Parola del giorno indicato
 */
async function getWinningWord(date=moment().format(), search="La #parola della #ghigliottina de #leredita di oggi è:", from="quizzettone") {
    search = search.replace(/\s\s+/g, " ");
    const query = `from:${from} "${search}"`;
    let start_date = moment(date).utc().startOf("day");
    let end_date = moment(date).utc().endOf("day");

    if (end_date > moment().utc()) {
        end_date = moment().utc();
    }

    try {
        const word = await getTweetsByKeyword(query, "", 10, start_date.toISOString(), end_date.toISOString());

        let tweetText = word.tweets[0].text.replace(/(\r\n|\n|\r)/gm, " ");           // Viene modificata la stringa togliendo gli "a capo"
        tweetText = tweetText.replace(/\s\s+/g, " ");                                 // Vengono collassati tutti gli spazi in uno solo

        const result = tweetText.match(new RegExp(`${search}\\s(\\w+)`))[1];          // Ricerca parola vincente

        return result
    } catch (err) {
        return null;
    }

}
