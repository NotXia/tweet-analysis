/**
 * 
 * Validatori generali
 * 
 */


module.exports.isBoolean = function (value, required) {
    if (!required && !value) return "";
    
    if (required && !value)                     throw new Error("Valore mancante");
    if (value != "true" && value != "false")    throw new Error("Formato invalido");
    return "";
}

/* Validatore per i codici ISO2 delle nazioni */
module.exports.isISO2Country = (value, required) => {
    if (!required && !value) return "";

    if (required && !value)   throw new Error("Valore mancante");
    if (value.length != 2)    throw new Error("Formato invalido");
    return "";
}