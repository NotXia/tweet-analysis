import { removeStopWords as _removeStopWords } from "modules/analysis/stopwords"

/**
 * Rimuove gli stopwords dal tweet
 * @param {String} tweet                Tweet da elaborare
 * @param {Object} options              Opzioni di analisi
 * @param {string} options.language     Lingua della frase
 * @param {string} options.bias         Lingua a cui far tendere la rilevazione (se la lingua della frase è incerta)
 * @returns {Promise<string>} Tweet senza stop words
 */
export async function removeStopwords(tweet, options={}) {
    return _removeStopWords(tweet, { language: options.language, bias: options.bias });
}