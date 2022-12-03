require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");
const moment = require("moment");


const tweet_scheme = mongoose.Schema ({
    _id: { type: String, required: true },
    date: String,
    game: String,
    tweet: {
        id: { type: String, required: true },
        name: String,
        username: String,
        pfp: String,
        text: String,
        time: String,
        likes: Number,
        comments: Number,
        retweets: Number,
        location: {
            id: String,
            full_name: String,
            country: String,
            coords: {
                long: String,
                lat: String
            }
        },
        media: [
            new mongoose.Schema({
                url: String,
                type: String
            }, { _id: false })
        ]
    },
    word: String
});


/**
 * Gestisce il salvataggio di un tweet
 * @param {Object} tweet    Tweet da salvare
 * @param {String} game     Nome del gioco
 * @param {String} date     Giorno del tweet (in formato ISO)
 */
tweet_scheme.statics.cacheTweet = async function(tweet, game, date) {
    if (process.env.NODE_ENV.includes("testing")) { return; }

    try {
        await new this({
            _id: tweet.tweet.id,
            date: moment(date).utc().startOf("day").toISOString(),
            game: game,
            tweet: {
                id: tweet.tweet.id,
                name: tweet.tweet.name,
                username: tweet.tweet.username,
                pfp: tweet.tweet.pfp,
                text: tweet.tweet.text,
                time: tweet.tweet.time,
                likes: tweet.tweet.likes,
                comments: tweet.tweet.comments,
                retweets: tweet.tweet.retweets,
                location: tweet.tweet.location,
                media: tweet.tweet.media
            },
            word: tweet.word
        }).save();
    }
    catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; } // Tweet già salvato
        throw err;
    }
};

/**
 * Estrae i tweet di un dato gioco in un dato giorno
 * @param {String} game     Nome del gioco
 * @param {String} date     Giorno del gioco (in formato ISO)
 */
tweet_scheme.statics.getCache = async function(game, date) {
    if (process.env.NODE_ENV.includes("testing")) { return null; }

    try {
        let tweets = await this.find({ date: moment(date).utc().startOf("day").toISOString(), game: game });
        return tweets;
    }
    catch (err) {
        return null;
    }
};


module.exports = mongoose.model("tvgame_tweets", tweet_scheme);