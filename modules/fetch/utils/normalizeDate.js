module.exports = {
    _normalizeDate : _normalizeDate
}

/**
 * Normalizza le date in input, impostandole in formato ISO 8601 e con gli orari della data di inizio e di fine impostati rispettivamente a 00:00:01 e 23:59:59
 * Inoltre, esegue i controlli sulla correttezza dell'intervallo temporale fra le due date
 * @param {string} start_time                           Data di inizio da normalizzare
 * @param {string} end_time                             Data di fine da normalizzare
 * @returns {{start_time: string, end_time: string}}    Oggetto contentente le due date normalizzate
 */
function _normalizeDate(start_time = '', end_time = '') {

    let today = new Date();
    if (start_time != '') {
        start_time = new Date(start_time);
        start_time.setUTCHours(0,0,1,0);
        today.setUTCHours(0,0,1,0);
        if (start_time.getTime() === today.getTime()) { start_time = ''; }
        else if (start_time > today) { throw new Error('Data di inizio non valida') }
    }
    if (end_time != '') { 
        end_time = new Date(end_time);
        end_time.setUTCHours(23,59,59,0);
        today.setUTCHours(23,59,59,0);
        if (end_time.getTime() === today.getTime()) { end_time = ''; }
        else if (end_time > today) { throw new Error('Data di fine non valida') }
    }
    
    if ((start_time != '' && end_time != '') && (end_time < start_time)) { throw new Error('Intervallo temporale non valido')}
    return {
        start_time: start_time,
        end_time: end_time
    };
}