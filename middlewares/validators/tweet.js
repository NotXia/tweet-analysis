/**
 * 
 * Validatori per i tweet
 * 
 */


/* Validatore del contenuto testuale del tweet */
module.exports.content = (value, required) => {
    if (!required && !value) return "";

    if ((required && !value) || value === "") throw new Error("Valore mancante");
    return "";
}