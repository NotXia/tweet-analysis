import axios from "axios";


/**
 * Ritorna il risultato della ricerca eseguita
 * @param {String} hashtag              Hashtag da cui prendere i tweet
 * @param {string} pag_token            Token della pagina dei tweet (default "")
 * @returns I tweet di output a seconda dei parametri inviati
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