module.exports.isBoolean = function (value, required) {
    if (required && !value)                     throw new Error("Valore mancante");
    if (value != "true" && value != "false")    throw new Error("Formato invalido");
    return "";
}