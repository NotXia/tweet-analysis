const { getWinningWord } = require("../modules/games/winningWord.js");
const WordModel = require("../models/WinningWord.js");

async function ghigliottinaWinningWord(req, res) {
    let winning_word = {};

    try {
        winning_word = await getWinningWord(req.query.date, req.query.search, req.query.from);
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    res.status(200).json({
        word: winning_word.word,
        date: winning_word.date
    });

    if (!process.env.NODE_ENV.includes("testing")) {
        // Caching tweet
        await Promise.all(winning_word.map(async (word) => WordModel.cacheWord(word)));
    }
}

module.exports = {
    ghigliottinaWinningWord: ghigliottinaWinningWord
};