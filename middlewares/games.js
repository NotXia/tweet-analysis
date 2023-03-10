const httpError = require("http-errors");
const date_validator = require("./validators/date.js");
const moment = require('moment');

const games = [
    function (req, _, next) {       //Validazione dell'input
        let errors = {};

        if (!req.query.date)  { req.query.date = ''; }

        // Se la data di inizio è nel futuro
        try { date_validator.isFuture(req.query.date); } catch (error) { errors.date = error.message; }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
];

/**
 * Controlla se la data inserita è valida
 */
const gamesCheckDate = [
    function (req, _, next) {       //Validazione dell'input
        let errors = {};

        if (!req.query.date)    { req.query.date = moment().format(); }

        // Se la data è nel futuro
        try { date_validator.isFuture(req.query.date); } catch (error) { errors.date = error.message; }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
];

const fantacitorioValidateUpdatePoliticianScore = [
    function (req, _, next) {       // Validazione dell'input
        let errors = {};

        // Se la data è nel futuro
        if (!req.body.politician) { errors["politician"] = "Nominativo del politico mancante"; }
        if (!req.body.score) { errors["score"] = "Punteggio mancante"; }
        if (!req.body.date) { errors["date"] = "Data mancante"; }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
]

module.exports = {
    gamesValidation: games,
    gamesWinningWordValidation: gamesCheckDate,
    fantacitorioRecapValidation: gamesCheckDate,
    fantacitorioValidateUpdatePoliticianScore: fantacitorioValidateUpdatePoliticianScore
};