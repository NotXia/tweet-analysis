import axios from "axios";
import moment from "moment";

export async function getPointsByWeek(date=moment().utc().startOf("day").toISOString()) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/recap`,
        params: {
            date: moment(date).utc().startOf("day").toISOString()
        }
    });

    return res.data;
}

export async function getRankings() {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/ranking`,
    });

    return res.data;
}

export async function getSquads(pag_token=undefined) {
    const res = await axios({
        method: "GET", url: `${process.env.REACT_APP_API_PATH}/games/fantacitorio/squads`,
        params: {
            pag_token: pag_token
        }
    });

    return res.data;
}