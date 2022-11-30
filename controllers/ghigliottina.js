const { getWinningWord } = require("../modules/games/winningWord.js");
const WordModel = require("../models/WinningWord.js");

async function ghigliottinaWinningWord(req, res) {
    let winning_word = {};

    try {
        winning_word = await WordModel.getWordOfDay(req.query.date, "l'eredita");

        if (!winning_word) {
                winning_word = await getWinningWord(req.query.date);
        }
    } catch (error) {
        if (error.message === "Tweet non trovato") { res.sendStatus(404); }
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

module.exports = {
    ghigliottinaWinningWord: ghigliottinaWinningWord
};