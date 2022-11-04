const httpError = require("http-errors");

const tweetsByUser = [
    function (req, res, next) {     //Validazione dell'input

        if (!req.query.user)        { return next(httpError(400, JSON.stringify({ user: 'Nome utente mancante' }))); }
        if (!req.query.pag_token)   { req.query.pag_token = ''; }
        if (!req.query.quantity)    { req.query.quantity = 10; }
        return next();
    }
];

module.exports = {
    tweetsByUserValidation: tweetsByUser
};