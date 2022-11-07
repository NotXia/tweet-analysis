const httpError = require("http-errors");

const tweetsByUser = [
    function (req, res, next) {     //Validazione dell'input
        let errors = {};
        //if (!req.query.user)        { return next(httpError(400, JSON.stringify({ user: 'Nome utente mancante' }))); }
        if (!req.query.user)        { errors.user = 'Nome utente mancante'; }
        if (!req.query.pag_token)   { req.query.pag_token = ''; }
        if (!req.query.quantity)    { req.query.quantity = 10; }
        if (!req.query.start_time)  { req.query.start_time = ''; }
        if (!req.query.end_time)    { req.query.end_time = ''; }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
];

module.exports = {
    tweetsByUserValidation: tweetsByUser
};