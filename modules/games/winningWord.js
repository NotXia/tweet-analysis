const { getTweetsByKeyword } = require("../fetch/keyword.js");
const moment = require('moment');

module.exports = { getWinningWord: getWinningWord }

/**
 * Restituisce la parola vincente del gioco della Ghigliottina del giorno scelto.
 * @param {string} date         Giorno scelto
 * @returns {Promise<string>}   Parola del giorno indicato
 */
async function getWinningWord(date="", search="La #parola della #ghigliottina de #leredita di oggi è:", from="quizzettone") {
    search = search.replace(/\s\s+/g, " ");
    const query = `from:${from} "${search}"`;

    try {
        const word = await getTweetsByKeyword(query, "", 10, moment(date).startOf("day"), moment(date).endOf("day"));
        
        let tweetText = word.tweets[0].text.replace(/(\r\n|\n|\r)/gm, " ");         // Viene modificata la stringa togliendo gli "a capo"
        tweetText = tweetText.replace(/\s\s+/g, " ");                               // Vengono collassati tutti gli spazi in uno solo

        var result = tweetText.match(new RegExp(`${search}\\s(\\w+)`))[1];          // Ricerca parola vincente

        return result
    } catch (err) {
        return null;
    }

}

