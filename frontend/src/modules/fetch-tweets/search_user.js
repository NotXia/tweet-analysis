import axios from "axios";


/**
 * Ritorna il risultato della ricerca eseguita
 * @param {String} user                 Utente a cui prendere i tweet
 * @param {string} pag_token            Token della pagina dei tweet (default "")
 * @param {number} quantity             Numero di tweet da ricercare (default 10)
 * @param {string} start_time           Data di inizio della ricerca
 * @param {string} end_time             Data di fine della ricerca
 * @returns I tweet di output a seconda dei parametri inviati
 */


export async function userSearchTweet(user, pag_token="", quantity=10, start_time="", end_time="") {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/tweets/user`,
        params: {
            user: user,
            pag_token: pag_token,
            quantity: quantity,
            start_time: start_time,
            end_time: end_time
        }
    });

    return res.data;
}