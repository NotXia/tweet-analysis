const httpError = require("http-errors");
const date_validator = require("./validators/date.js");
const moment = require('moment');
moment().format();

const ghigliottinaWinningWord = [
    function (req, _, next) {       //Validazione dell'input
        let errors = {};

        if (!req.query.date)    { req.query.date = moment().format(); }

        // Se la data è nel futuro
        try { date_validator.isFuture(req.query.date); } catch (error) { errors.date = error.message; }

        if (Object.keys(errors).length !== 0) { return next( httpError(400, JSON.stringify(errors)) ); }
        return next();
    }
];

module.exports = {
    ghigliottinaWinningWordValidation: ghigliottinaWinningWord
};