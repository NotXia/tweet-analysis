require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");


const tweet_scheme = mongoose.Schema ({
    _id: { type: String, required: true },
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
});


/**
 * Gestisce il salvataggio di un tweet
 * @param {Object} tweet    Tweet da salvare
 */
tweet_scheme.statics.cacheTweet = async function(tweet) {
    try {
        await new this({
            _id: tweet.id,
            name: tweet.name,
            username: tweet.username,
            pfp: tweet.pfp,
            text: tweet.text,
            time: tweet.time,
            likes: tweet.likes,
            comments: tweet.comments,
            retweets: tweet.retweets,
            location: tweet.location,
            media: tweet.media
        }).save();
    }
    catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; } // Tweet già salvato
        throw err;
    }
};


module.exports = mongoose.model("tweets", tweet_scheme);