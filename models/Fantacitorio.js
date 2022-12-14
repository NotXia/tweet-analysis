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
        points = Object.keys(points).map((politician) => ({
            politician: politician,
            points: points[politician]
        }));

        let cached_data = await this.findOne({ date: moment.utc(date).startOf("isoweek").toISOString() });

        if (cached_data) { // Dati già salvati in precendeza, aggiorno con la versione più recente
            cached_data.points = points;
            await cached_data.save();
        }
        else {
            await new this({
                points: points,
                date: moment.utc(date).startOf("isoweek").toISOString(),
            }).save();
        }
    } catch (err) {
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