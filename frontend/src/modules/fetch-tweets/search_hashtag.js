import axios from "axios";


/**
 * Analizza il sentimento di un tweet
 * @param {String} tweet                Tweet da analizzare
 * @param {Object} options              Opzioni di analisi
 * @param {string} options.language     Lingua della frase
 * @param {string} options.bias         Lingua a cui far tendere la rilevazione (se la lingua della frase è incerta)
 * @returns {Promise<{sentiment:string, score:number, language:string}>} Sentimento ("positive", "neutral", "negative"), score della frase e lingua con cui è stata analizzata
 */
export async function hashtagSearchTweet(hashtag, pag_token="") {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/tweets/hashtag`,
        params: {
            hashtag: hashtag,
            pagination_token: pag_token
        }
    });

    return res.data;
}