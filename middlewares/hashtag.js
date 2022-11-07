const httpError = require("http-errors");
const date_validator = require("./validators/date.js");
const moment = require('moment');
moment().format();

const tweetsByHashtag = [
    function (req, _, next) {       //Validazione dell'input
        let errors = {};

        if (!req.query.hashtag)     { errors.hashtag = "Hashtag mancante"; }
        if (!req.query.pag_token)   { req.query.pag_token = ""; }
        if (!req.query.quantity)    { req.query.quantity = 10; }
        if (!req.query.start_time)  { req.query.start_time = ''; }
        if (!req.query.end_time)    { req.query.end_time = ''; }

        let today = new Date();
        let aweekago = new Date(moment(today).subtract(7, 'days'));

        // Se la data di inizio è nel futuro
        try { date_validator.isFuture(req.query.start_time); } catch (error) { errors.start_time = error.message; }

        // Se la data di fine è prima del limite
        try { date_validator.isBeforeLimit(req.query.end_time, aweekago); } catch (error) { errors.end_time = error.message; }

        //Se la data di fine è prima della data di inizio
        try { date_validator.isEndBeforeStart(req.query.start_time, req.query.end_time); } catch (error) { errors.dates = error.message }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
];

module.exports = {
    tweetsByHashtagValidation: tweetsByHashtag
};