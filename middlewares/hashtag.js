const httpError = require("http-errors");

const tweetsByHashtag = [
    function (req, _, next) {       //Validazione dell'input

        if (!req.query.hashtag)     { return next(httpError(400, JSON.stringify({ hashtag: "Hashtag mancante" }))); }
        if (!req.query.pag_token)   { req.query.pag_token = ""; }
        if (!req.query.quantity)    { req.query.quantity = 10; }
        return next();
    }
];

module.exports = {
    tweetsByHashtagValidation: tweetsByHashtag
};