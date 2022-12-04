const httpError = require("http-errors");
const date_validator = require("./validators/date.js");
const moment = require('moment');
moment().format();

const tweetsByKeyword = [
    function (req, _, next) {       //Validazione dell'input
        let errors = {};

        if (!req.query.keyword)     { errors.keyword = "Parola chiave mancante"; }
        if (!req.query.pag_token)   { req.query.pag_token = ""; }
        if (!req.query.quantity)    { req.query.quantity = 10; }
        if (!req.query.start_time)  { req.query.start_time = ''; }
        if (!req.query.end_time)    { req.query.end_time = ''; }

        const limit = new Date('2006-03-26T00:00:01Z');

        // Se la data di inizio è nel futuro
        try { date_validator.isFuture(req.query.start_time); } catch (error) { errors.start_time = error.message; }

        try { date_validator.isBeforeLimit(req.query.end_time, limit); } catch (error) { errors.end_time = error.message; }

        //Se la data di fine è prima della data di inizio
        try { date_validator.isEndBeforeStart(req.query.start_time, req.query.end_time); } catch (error) { errors.dates = error.message }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
];

module.exports = {
    tweetsByKeywordValidation: tweetsByKeyword
};