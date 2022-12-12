require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");
const moment = require("moment");

const fantacitorio_scheme = mongoose.Schema ({
    points: [ { 
        politician: {type: String, required: true},
        points: {type: Number, required: true}
    } ],
    date: {type: String, required: true, unique: true}
});

fantacitorio_scheme.statics.cachePoints = async function(points, date) {
    if (process.env.NODE_ENV.includes("testing")) { return; }

    try {
        if (await this.getPointsOfWeek(date)) { return; } // Punteggio già in cache

        points = Object.keys(points).map((politician) => ({
            politician: politician,
            points: points[politician]
        }));

        await new this({
            points: points,
            date: moment.utc(date).startOf("isoweek").toISOString(),
        }).save();
    } catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; } // Punteggio già inserito
        throw err;
    }
};

fantacitorio_scheme.statics.getPointsOfWeek = async function(date) {
    if (process.env.NODE_ENV.includes("testing")) { return null; }

    try {
        let points = await this.findOne({ date: moment.utc(date).startOf("isoweek").toISOString() });
        if(!points) { return null; }

        let parsedPoints = {};

        for(const row of points.points) {
            parsedPoints[row.politician] = row.points;
        }

        return parsedPoints;
    } catch (err) {
        return null;
    }
}

module.exports = mongoose.model("fantacitorio", fantacitorio_scheme);