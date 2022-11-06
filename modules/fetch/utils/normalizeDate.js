module.exports = {
    _normalizeDate : _normalizeDate
}

/**
 * Normalizza le date in input, impostandole in formato ISO 8601 e con gli orari della data di inizio e di fine impostati rispettivamente a 00:00:00.000 e 23:59:59.999
 * Inoltre, esegue i controlli sulla correttezza dell'intervallo temporale fra le due date
 * @param {string} start_time                           Data di inizio da normalizzare
 * @param {string} end_time                             Data di fine da normalizzare
 * @returns {{start_time: string, end_time: string}}    Oggetto contentente le due date normalizzate
 */
function _normalizeDate(limit, start_time = '', end_time = '') {

    let today = new Date();
    

    if (start_time != '') {
        start_time = new Date(start_time);
        start_time.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        if (start_time < limit) { start_time = ''; }   // Se la data di inizio è prima del limite massimo di twitter, non viene impostata (quindi é illimitata)
        else if (start_time.getTime() !== today.getTime() && start_time > today) { throw new Error('Data di inizio non valida') }  // Se la data di inizio è nel futuro, viene lanciato un errore
    }
    if (end_time != '') { 
        end_time = new Date(end_time);
        end_time.setHours(23,59,59,999);
        today.setHours(23,59,59,999);
        if ((end_time.getTime() === today.getTime()) || end_time > today) { end_time = ''; }   // Se la data di fine è oggi o nel futuro, non viene impostata (quindi i tweet arriveranno a oggi)
        else if (end_time < limit) { throw new Error('Data di fine non valida') }   // Se la data di fine è prima del limite massimo di twitter, viene lanciato un errore
    }
    
    if ((start_time != '' && end_time != '') && (end_time < start_time)) { throw new Error('Intervallo temporale non valido')}
    return {
        start_time: start_time,
        end_time: end_time
    };
}