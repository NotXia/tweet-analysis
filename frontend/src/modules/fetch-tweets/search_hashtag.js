import axios from "axios";


/**
 * Ritorna il risultato della ricerca eseguita
 * @param {String} hashtag              Hashtag da cui prendere i tweet
 * @param {string} pag_token            Token della pagina dei tweet (default "")
 * @param {number} quantity             Numero di tweet da ricercare (default 10)
 * @returns I tweet di output a seconda dei parametri inviati
 */


export async function hashtagSearchTweet(hashtag, pag_token="", quantity=10) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/tweets/hashtag`,
        params: {
            hashtag: hashtag,
            pag_token: pag_token,
            quantity: quantity
        }
    });

    return res.data;
}