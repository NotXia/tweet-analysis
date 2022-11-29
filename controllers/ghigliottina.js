const { ghigliottina } = require("../modules/games/ghigliottina.js");
const TweetModel = require("../models/Ghigliottina.js");

async function gamesGhigliottina(req, res) {
    let tweets_response;

    try {
        tweets_response = await ghigliottina(req.query.date);
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    res.status(200).json({ tweets: tweets_response });

    if (!process.env.NODE_ENV.includes("testing")) {
        // Caching tweet
        await Promise.all(tweets_response.map(async (tweet) => TweetModel.cacheTweet(tweet)));
    }
}

module.exports = {
    gamesGhigliottina: gamesGhigliottina
};