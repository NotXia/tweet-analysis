import axios from "axios";
import moment from "moment";

/**
 * Restituisce i punteggi della settimana della data ricevuta
 * @param {String} date         Data da cercare in formato ISO 8601
 * @returns {Promise<Object>}   Chiavi dei politici e i loro punteggi
 */
export async function getPointsByWeek(date=moment().utc().startOf("day").toISOString()) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/recap`,
        params: {
            date: moment(date).utc().startOf("day").toISOString()
        }
    });

    return res.data;
}

/**
 * Restituisce la classifica complessiva attuale
 * @returns {Promise<{[politician:String, points:Number]}>} un dizionario che contiene il nome dei politici e i loro punteggi
 */
export async function getRankings() {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/ranking`,
    });

    return res.data;
}

/**
 * Restituisce i tweet di coloro che hanno una squadra di fantacitorio
 * @param {String} pag_token                            Punto di partenza della ricerca
 * @returns {Promise<[{tweet:Object, squad:string}]>}   L'array delle squadre
 */
export async function getSquads(pag_token=undefined) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/squads`,
        params: {
            pag_token: pag_token
        }
    });

    return res.data;
}

/**
 * Restituisce i tweet di coloro che hanno una squadra di fantacitorio per username
 * @param {String} username                            Utente per cui cercare
 * @returns {Promise<{tweet:Object, squad:string}>}    La squadra dell'utente
 */
export async function getSquadByUsername(username) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/squads`,
        params: {
            username: username
        }
    });

    return res.data.tweets[0];
}

/**
 * Aggiorna il punteggio settimanale del politico
 * @param {String} politician_name          Punto di partenza della ricerca
 * @param {Number} points                   Punteggio nuovo
 * @param {String} date                     Settimana del punteggio da aggiornare
 */
export async function updateWeekPoints(politician_name, points, date) {
    await axios({
        method: "PUT", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/recap`,
        data: {
            politician: politician_name,
            score: points,
            date: date
        }
    });
}

/**
 * Restituisce le statistiche interessanti della classifica
 */
export async function getRankingStatistics() {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/statistics`
    });
    return res.data;
}