const { getPointsByWeek } = require("../modules/games/fantacitorio.js");
const FantacitorioModel = require("../models/Fantacitorio.js");
const moment = require("moment");

module.exports = {
    fetchCurrentWeekScores: fetchCurrentWeekScores
}

async function fetchCurrentWeekScores() {
    const today = moment.utc().toISOString();

    try {
        const points = await getPointsByWeek(today);
        await FantacitorioModel.cachePoints(points, today);
    }
    catch (err) {
        await FantacitorioModel.cachePoints({}, today); // Nessun punteggio per la settimana
    }
}