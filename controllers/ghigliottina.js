const { getWinningWord } = require("../modules/games/winningWord.js");
const WordModel = require("../models/WinningWord.js");
const { ghigliottina } = require("../modules/games/ghigliottina.js");
const TweetModel = require("../models/Ghigliottina.js");

async function ghigliottinaWinningWord(req, res) {
    let winning_word = {};

    try {
        winning_word = await WordModel.getWordOfDay(req.query.date, "l'eredita");

        if (!winning_word) {
        winning_word = await getWinningWord(req.query.date, "La #parola della #ghigliottina de #leredita di oggi è:", "quizzettone");
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
        await WordModel.cacheWord(winning_word, "l'eredita");
    }
}


async function gamesGhigliottina(req, res) {
    let tweets_response;
    let should_cache = false;

    try {
        tweets_response = await TweetModel.cacheGhigliottina(req.query.date);
        
        if (!tweets_response || tweets_response.length === 0) {
            should_cache = true;
            tweets_response = await ghigliottina(req.query.date);
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
    gamesGhigliottina: gamesGhigliottina,
    ghigliottinaWinningWord: ghigliottinaWinningWord
};