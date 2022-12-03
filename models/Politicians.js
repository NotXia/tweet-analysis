require('dotenv').config();
const mongoose = require("mongoose");
const consts = require("./utils/consts.js");


const politician_scheme = mongoose.Schema ({
    fullname: { type: String, required: true, unique: true },
    alias: [ String ]
});


/**
 * Gestisce il salvataggio di un politico
 * @param {String} name
 * @param {String} surname
 */
politician_scheme.statics.store = async function(name, surname) {
    name = name.trim().toLowerCase();
    surname = surname.trim().toLowerCase();

    let name_initials_list = name.split(" ").map((name_part) => name_part[0]);  // Lista delle iniziali
    name_initials_list.push("");                                                // Segnala la fine (per join)

    let name_initials =              name_initials_list.join(" ").trim();       // Iniziali con spazio
    let name_initials_nospaces =     name_initials_list.join("").trim();        // Iniziali senza spazio
    let name_initials_dot =          name_initials_list.join(". ").trim();      // Iniziali con punto e spazio
    let name_initials_dot_nospaces = name_initials_list.join(".").trim();       // Iniziali con punto

    let alias = [
        `${surname}`,
        // [Cognome Nome] e variazioni sul nome
        `${surname} ${name}`,
        `${surname} ${name_initials}`, `${surname} ${name_initials_dot}`, `${surname} ${name_initials_dot_nospaces}`, `${surname} ${name_initials_nospaces}`,
        // [Nome Cognome] e variazioni sul nome
        `${name} ${surname}`,
        `${name_initials} ${surname}`, `${name_initials_dot} ${surname}`, `${name_initials_dot_nospaces} ${surname}`, `${name_initials_nospaces} ${surname}`,
        // Tutto attaccato
        `${surname}${name}`, `${name}${surname}`,
        `${surname}${name_initials}`, `${surname}${name_initials_dot}`, `${surname}${name_initials_nospaces}`, `${surname}${name_initials_dot_nospaces}`,
        `${name_initials}${surname}`, `${name_initials_dot}${surname}`, `${name_initials_nospaces}${surname}`, `${name_initials_dot_nospaces}${surname}`,
    ];

    try {
        await new this({ fullname: `${surname.toUpperCase()} ${name.toUpperCase()}`, alias: alias }).save();
    }
    catch (err) {
        if (err.code === consts.MONGO_DUPLICATED_KEY) { return; }
        throw err;
    }
};

/**
 * Gestisce la ricerca di un politico
 * @param {String} query    Politico da cercare
 * @returns {String} Nome e cognome normalizzato del politico
 */
 politician_scheme.statics.get = async function(query) {
    query = query.trim().replace(/\s\s+/g, " ").toLowerCase();

    const politician = await this.findOne({ alias: query });
    return politician?.fullname;
};


module.exports = mongoose.model("politicians", politician_scheme);