const { getWinningWord } = require("../modules/games/winningWord.js");
const WordModel = require("../models/WinningWord.js");
const { catenaFinale } = require("../modules/games/catenaFinale.js");
const TweetModel = require("../models/CatenaFinale.js");

async function catenaFinaleWinningWord(req, res) {
    let winning_word = {};

    try {
        winning_word = await WordModel.getWordOfDay(req.query.date, "reazione a catena");

        if (!winning_word) {
        winning_word = await getWinningWord(req.query.date, "La #parola della #catena finale per #reazioneacatena di oggi è:", "quizzettone");
        }
    } catch (error) {
        if (error.message === "Tweet non trovato") { return res.sendStatus(404); }
        res.sendStatus(500);
        return;
    }

    res.status(200).json({
        word: winning_word.word,
        date: winning_word.date
    });

    if (!process.env.NODE_ENV.includes("testing")) {
        // Caching tweet
        await WordModel.cacheWord(winning_word, "reazione a catena");
    }
}


async function gamesCatenaFinale(req, res) {
    let tweets_response;
    let should_cache = false;

    try {
        tweets_response = await TweetModel.cacheCatenaFinale(req.query.date);
        
        if (!tweets_response || tweets_response.length === 0) {
            should_cache = true;
            tweets_response = await catenaFinale(req.query.date);
        }
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    res.status(200).json({ tweets: tweets_response });

    if (!process.env.NODE_ENV.includes("testing")) {
        // Caching tweet
        if (should_cache) {
            await Promise.all(tweets_response.map(async (tweet) => TweetModel.cacheTweet(tweet, req.query.date)));
        }
    }
}

module.exports = {
    gamesCatenaFinale: gamesCatenaFinale,
    catenaFinaleWinningWord: catenaFinaleWinningWord
};