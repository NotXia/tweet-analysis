module.exports = {
    removePunctuation: removePunctuation
}

/**
 * Rimuove la punteggiatura da una stringa
 * @param {string} sentence     Stringa da elaborare
 * @returns {string} Frase senza punteggiatura e senza spazi multipli
 */
function removePunctuation(sentence) {
    return sentence.replace(/[.,!?;:'"()-]/g," ") // Rimuove punteggiatura
                   .replace(/\s{2,}/g," ")                        // Collassa multipli spazi in uno solo
                   .trim();
}