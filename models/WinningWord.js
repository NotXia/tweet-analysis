require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");
const moment = require("moment");

const word_scheme = mongoose.Schema ({
    word: String,
    date: String,
    game: String
})

/**
 * Gestisce il salvataggio di una parola del giorno
 * @param {Object} winning_word    Parola da salvare
 */
word_scheme.statics.cacheWord = async function(winning_word, game) {
    if (process.env.NODE_ENV.includes("testing")) { return; }

    try {
        if (await this.getWordOfDay(moment(winning_word.date).utc().startOf("day").toISOString(), game)) { return; } // Parola già in cache
        
        await new this({
            word: winning_word.word,
            date: moment(winning_word.date).utc().startOf("day").toISOString(),
            game: game
        }).save();
    } catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; } // Parola già inserita
        throw err;
    }
};


/**
 * Marca un giorno come senza parola vincente
 * @param {string} date    Giorno da marcare (formato ISO)
 * @param {string} game    Gioco di riferimento
 */
word_scheme.statics.setNoWordDay = async function(date, game) {
    if (process.env.NODE_ENV.includes("testing")) { return; }

    try {
        if (await this.getWordOfDay(moment.utc(date).startOf("day").toISOString(), game)) { return; } // Parola già in cache
        
        await new this({
            word: "",
            date: moment.utc(date).startOf("day").toISOString(),
            game: game
        }).save();
    } catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; } // Parola già in cache
        throw err;
    }
};


/**
 * Restituisce la parola del giorno cercato, se esiste.
 * @param {String} date         Data da ricercare
 * @returns {Promise<Object|null>}   Parola del giorno, null se cache miss
 */
word_scheme.statics.getWordOfDay = async function(date, game) {
    if (process.env.NODE_ENV.includes("testing")) { return null; }

    try {
        const word = await this.findOne({ date: moment(date).utc().startOf("day").toISOString(), game: game });
        if(!word) { return null; }
        return { word: word.word, date: word.date };
    } catch (err) {
        return null;
    }
}

module.exports = mongoose.model("winning_word", word_scheme);