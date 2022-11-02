const httpError = require("http-errors");
const tweet_validator = require("./validators/tweet.js");
const generic_validator = require("./validators/generic.js");


const sentiment = [
    function (req, res, next) { /* Validazione dell'input */
        let errors = {};
    
        try { tweet_validator.content(req.query.tweet, true); }             catch (err) { errors.tweet = err.message; }
        try { generic_validator.isISO2Country(req.query.lang, false); }     catch (err) { errors.lang = err.message; }
        try { generic_validator.isISO2Country(req.query.bias, false); }     catch (err) { errors.bias = err.message; }
    
        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    },
    function (req, res, next) { /* Manipolazione dell'input */
        req.query.lang = req.query.lang?.toLowerCase();
        req.query.bias = req.query.bias?.toLowerCase();
        return next();
    }
];

const stopwords = sentiment;


module.exports = {
    sentimentValidation: sentiment,
    stopwordsRemovalValidation: stopwords
}