const { getPointsByWeek } = require("../modules/games/fantacitorio.js");
const FantacitorioModel = require("../models/Fantacitorio.js");
const moment = require("moment");

module.exports = {
    fetchCurrentWeekScores: fetchCurrentWeekScores
}

async function fetchCurrentWeekScores() {
    const today = moment.utc().toISOString();
    const points = await getPointsByWeek(today);

    await FantacitorioModel.cachePoints(points, today);
}