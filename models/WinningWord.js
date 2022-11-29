require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");
const moment = require("moment");
const { findOne } = require('./Tweets.js');

const word_scheme = mongoose.Schema ({
    word: String,
    date: String
})

/**
 * Gestisce il salvataggio di una parola del giorno
 * @param {Object} winning_word    Parola da salvare
 */
word_scheme.statics.cacheWord = async function(winning_word) {
    try {
        await new this({
            word: winning_word.word,
            date: moment(winning_word.date).startOf("day").toISOString()
        }).save();
    } catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; } // Parola già inserita
        throw err;
    }
};

/**
 * Restituisce la parola del giorno cercato, se esiste.
 * @param {String} date         Data da ricercare
 * @returns {Promise<string>}   Parola del giorno 
 */
word_scheme.statics.getWordOfDay = async function(date) {
    try {
        const word = await this.findOne({ date: moment(date).startOf("day").toISOString() });
        if(!word) { return null; }
        return word.word;
    } catch (err) {
        return null;
    }
}

module.exports = mongoose.model("winning_word", word_scheme);