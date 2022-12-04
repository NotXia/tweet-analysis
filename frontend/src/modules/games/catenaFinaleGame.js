import axios from "axios";
import moment from "moment";


/**
 * Restituisce i tweet di chi prova a indovinare la #catena finale di un dato giorno
 * @param {String} date      Data da cercare in formato ISO 8601
 * @returns {Promise<[{tweet:Object, word:String}]>}  tweet dati del tweet, word parola tentata
 */
export async function getCatenaFinaleAttempts(date=moment().utc().startOf("day").toISOString()) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/catenaFinale`,
        params: {
            date: moment(date).utc().startOf("day").toISOString()
        }
    });

    return res.data;
}

/**
 * Restituisce la parola vincente della #catena finale di un dato giorno
 * @param {String} date      Data da cercare in formato ISO 8601
 * @returns {Promise<{word:String, date:String}>}  word parola vincente, date data e ora della pubblicazione del tweet con la parola vincente
 */
 export async function getCatenaFinaleWord(date=moment().utc().startOf("day").toISOString()) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/catenafinale/winning_word`,
        params: {
            date: moment(date).utc().startOf("day").toISOString()
        }
    });

    return res.data;
}