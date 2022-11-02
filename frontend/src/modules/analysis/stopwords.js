import axios from "axios";


/**
 * Rimuove gli stopwords dal tweet
 * @param {String} tweet                Tweet da elaborare
 * @param {Object} options              Opzioni di analisi
 * @param {string} options.language     Lingua della frase
 * @param {string} options.bias         Lingua a cui far tendere la rilevazione (se la lingua della frase è incerta)
 * @returns {Promise<string>} Tweet senza stop words
 */
export async function removeStopwords(tweet, options={}) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/analysis/stopwords`,
        params: {
            tweet: tweet, 
            bias: options.bias, lang: options.language
        }
    });

    return res.data.sentence;
}