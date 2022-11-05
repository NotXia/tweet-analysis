module.exports = {
    _normalizeDate : _normalizeDate
}

/**
 * Normalizza le date in input, impostandole in formato ISO 8601 e con gli orari della data di inizio e di fine impostati rispettivamente a 00:00:01 e 23:59:59
 * Inoltre, se il parametro della data di fine è di default, la imposta alla data odierna
 * @param {string} start_time                           Data di inizio da normalizzare
 * @param {string} end_time                             Data di fine da normalizzare
 * @returns {{start_time: string, end_time: string}}    Oggetto contentente le due date normalizzate
 */
function _normalizeDate(start_time, end_time) {

    if (end_time == '') { end_time = new Date(); } else { end_time = new Date(end_time); }
    end_time.setUTCHours(23,59,59);

    start_time = new Date(start_time);
    start_time.setUTCHours(0, 0, 1);

    return {
        start_time: start_time,
        end_time: end_time
    };
}