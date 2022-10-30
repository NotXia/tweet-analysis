import axios from "axios";


/**
 * Ritorna il risultato della ricerca eseguita
 * @param {String} user                 Utente a cui prendere i tweet
 * @param {string} pag_token            Token della pagina dei tweet (default undefined)
 * @returns I tweet di output a seconda dei parametri inviati
 */


export async function userSearchTweet(user, pag_token="") {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/tweets/user`,
        params: {
            user: user,
            pag_token: pag_token
        }
    });

    return res.data;
}