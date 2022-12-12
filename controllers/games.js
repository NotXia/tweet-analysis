const { getWinningWord } = require("../modules/games/winningWord.js");
const WordModel = require("../models/WinningWord.js");
const TVGameModel = require("../models/TVGame.js");
const moment = require("moment");


/**
 * Genera il controller per estrarre la parola vincente di un dato gioco
 * @param {String} game_name         Nome del gioco
 * @param {String} query_phrase      Frase che precede la parola vincente
 * @param {String} query_user        Utente da cui cercare la parola vincente
 */
function winningWord(game_name, query_phrase, query_user) {
    return async function (req, res) {
        let winning_word = {};
    
        try {
            winning_word = await WordModel.getWordOfDay(req.query.date, game_name);
    
            if (!winning_word) {
                winning_word = await getWinningWord(req.query.date, query_phrase, query_user);
            }

            if (winning_word.word === "") { throw new Error("Tweet non trovato"); }
        } catch (error) {
            if (error.message === "Tweet non trovato") {
                if (!moment(req.query.date).isSame(moment(), "day")) { // Se non è oggi, marca il giorno come senza parola del giorno
                    await WordModel.setNoWordDay(req.query.date, game_name);
                }
                return res.sendStatus(404); 
            }
            res.sendStatus(500);
            return;
        }
    
        res.status(200).json({
            word: winning_word.word,
            date: winning_word.date
        });
    
        if (!process.env.NODE_ENV.includes("testing")) {
            // Caching tweet
            await WordModel.cacheWord(winning_word, game_name);
        }
    }
}

/**
 * Genera il controller per estrarre i tentativi di indovinare la parola di un dato gioco
 * @param {function} tweet_fetcher     Funzione che estrae i tweet
 * @param {String} game_name         Nome del gioco
 */
function userAttempts(tweet_fetcher, game_name) {
    return async function gamesGhigliottina(req, res) {
        let tweets_response;
        let should_cache = false;
    
        try {
            tweets_response = await TVGameModel.getCache(game_name, req.query.date);
    
            if (!tweets_response) {
                should_cache = true;
                tweets_response = await tweet_fetcher(req.query.date);
            }
        } catch (error) {
            res.sendStatus(500);
            return;
        }
    
        res.status(200).json({ tweets: tweets_response });
    
        if (!process.env.NODE_ENV.includes("testing")) {
            // Caching tweet
            if (should_cache || moment(req.query.date).isSame(moment(), "day")) { // Prova sempre a fare caching dei tweet di oggi
                if (tweets_response.length === 0 && !moment(req.query.date).isSame(moment(), "day")) { // Giorno senza tentativi
                    await TVGameModel.setNoGameDay(game_name, req.query.date) 
                }
                else {
                    await Promise.all(tweets_response.map(async (tweet) => TVGameModel.cacheTweet(tweet, game_name, req.query.date)));
                }
            }
        }
    }
}

module.exports = {
    userAttempts: userAttempts,
    winningWord: winningWord
};