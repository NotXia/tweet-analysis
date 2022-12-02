require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");


const tweet_scheme = mongoose.Schema ({
    _id: { type: String, required: true },
    date: String,
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
 */
tweet_scheme.statics.cacheTweet = async function(tweet, date) {
    if (process.env.NODE_ENV.includes("testing")) { return; }

    try {
        await new this({
            _id: tweet.tweet.id,
            date: date,
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

tweet_scheme.statics.cacheGhigliottina = async function(date) {
    if (process.env.NODE_ENV.includes("testing")) { return null; }

    try {
        let tweets = await this.find({ date: date });
        return tweets;
    }
    catch (err) {
        return null;
    }
};


module.exports = mongoose.model("tweets_ghigliottina", tweet_scheme);