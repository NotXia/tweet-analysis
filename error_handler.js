const httpError = require("http-errors");

function error_handler (err, req, res, next) {
    if (err) {
        if (httpError.isHttpError(err)) {
            if (err.message) { return res.status(err.status).json({ errors: JSON.parse(err.message) }); }
            else { return res.sendStatus(err.status); }
        }
        else {
            console.error(err);
            return res.sendStatus(500);
        }
    }
    else {
        return next();
    }
}

module.exports = {
    error_handler: error_handler
}