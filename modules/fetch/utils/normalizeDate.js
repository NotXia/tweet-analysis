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
    let limit = new Date('2010-11-06T00:00:01Z');

    if (start_time != '') {
        start_time = new Date(start_time);
        start_time.setUTCHours(0,0,1,0);
        today.setUTCHours(0,0,1,0);
        if (start_time < limit) { start_time = ''; }   // Se la data di inizio è prima del limite massimo di twitter, non viene impostata (quindi é illimitata)
        else if (start_time.getTime() !== today.getTime() && start_time > today) { throw new Error('Data di inizio non valida') }  // Se la data di inizio è nel futuro, viene lanciato un errore
    }
    if (end_time != '') { 
        end_time = new Date(end_time);
        end_time.setUTCHours(23,59,59,0);
        today.setUTCHours(23,59,59,0);
        if (end_time.getTime() === today.getTime()) { end_time = ''; }   // Se la data di fine è oggi, non serve impostarla
        else if (end_time < limit || end_time > today) { throw new Error('Data di fine non valida') }   // Se la data di fine è prima del limite massimo di twitter o nel futuro, viene lanciato un errore
    }
    
    if ((start_time != '' && end_time != '') && (end_time < start_time)) { throw new Error('Intervallo temporale non valido')}
    return {
        start_time: start_time,
        end_time: end_time
    };
}