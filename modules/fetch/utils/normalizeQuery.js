module.exports = {
    _normalizeQuery : _normalizeQuery
}

/**
 * Normalizza la query in input, rimuovendo il carattere @ o # da inizio stringa (se presente) ed eventuali spazi
 * @param {string} query            Query da normalizzare
 * @returns {string}                Query normalizzata
 */
function _normalizeQuery(query) {
    if(query.length == 0) { return ""; }
    
    query = query.trim();

    if(query[0] !== '@' && query[0] !== '#') { return query; }  // Ricerca per parola/frase chiave
    
    query = query.replace(/\s/g, '');   // Rimuove tutti gli spazi
    if(query[0] == '@') {
        query = query.slice(1);         // Se la stringa inizia con @ viene rimosso perché la query richiede solo lo username
    }

    return query;
}
