/**
 * 
 * Validatori per le date
 * 
 */


 module.exports.isFuture = function (date) {
    if (date != '') {
        date = new Date(date);
        date.setHours(0,0,0,0);
        let today = new Date();
        today.setHours(0,0,0,0);
        if (date > today) { throw new Error('Data di inizio non valida'); }
    }
    return '';
}

module.exports.isBeforeLimit = function (date, limit) {
    if (date != '') {
        date = new Date(date);
        date.setHours(23,59,59,999);
        if (date < limit) { throw new Error('Data di fine non valida'); }
    }
    return '';
}

module.exports.isEndBeforeStart = function (start, end) {
    if (start != '' && end != '') {
        start = new Date(start);
        start.setHours(0,0,0,0);
        end = new Date(end);
        end.setHours(23,59,59,999);
        if (end < start) { throw new Error('Intervallo temporale non valido')}
    }
    return '';
}