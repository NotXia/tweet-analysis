require("dotenv").config();
const stopword = require("stopword");
const getCountryISO3 = require("country-iso-2-to-3");
const { detectLanguage } = require("./language");
const { removePunctuation } = require("./utils/removePunctuation");


module.exports = {
    removeStopWords: removeStopWords
};


/**
 * Rimuove da una frase le stop words (parole superflue al significato della frase)
 * @param {string} sentence             Frase da analizzare
 * @param {Object} options              Opzioni di analisi
 * @param {string} options.language     Lingua della frase
 * @param {string} options.bias         Lingua a cui far tendere la rilevazione (se la lingua della frase è incerta)
 * @returns {string} Frase senza stop words
 */
function removeStopWords(sentence, options) {
    let to_use_language;

    if (!options?.language && !options?.bias) { to_use_language = detectLanguage(sentence); }  // Rilevamento lingua senza indizzi
    else if (options.language) { to_use_language = options.language; }                         // Lingua fornita in input
    else { to_use_language = detectLanguage(sentence, options.bias); }                         // Rilevamento lingua con bias suggerito 
    
    let stopwords_list = _getStopwordsList(to_use_language);

    sentence = _removeStopwords(sentence, stopwords_list);  // Prima passata preliminare
    sentence = removePunctuation(sentence);
    sentence = _removeStopwords(sentence, stopwords_list);  // Seconda passata senza la punteggiatura
    
    return sentence;
}

/**
 * Rimuove gli stop words indicati dalla stringa
 * @param {string} sentence             Stringa da elaborare
 * @param {[string]} stopwords_list     Lista di stop words da rimuovere
 * @returns {string} Stringa senza gli stop words indicati
 */
function _removeStopwords(sentence, stopwords_list) {
    let no_stopwords_list = stopword.removeStopwords(sentence.split(" "), stopwords_list);
    sentence = no_stopwords_list.join(" "); // Ricomposizione della stringa

    return sentence;
}

/**
 * Restituisce gli stop words di una data lingua
 * @param {string} language     Lingua in formato ISO-2
 * @returns {[string]} Lista degli stop words per la data lingua
 */
function _getStopwordsList(language) {
    let stopwords_list;

    // Seleziona la libreria con gli stop words migliori per la lingua
    switch (language) {
        case "ita":     stopwords_list = require('stopwords-it'); break;
        default:        stopwords_list = stopword[getCountryISO3(language.toUpperCase()).toLowerCase()]; break; // La libreria accetta i codici ISO 3 delle nazioni
    }

    if (!stopwords_list) { stopwords_list = []; }
    return stopwords_list;
}