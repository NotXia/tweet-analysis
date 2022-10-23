require("dotenv").config();
const lngDetector = new (require("languagedetect"));
lngDetector.setLanguageType("iso2");

const BIAS_TOLLERANCE = 0.1;


module.exports = sentiment;

if (process.env.NODE_ENV === "testing") {
    module.exports = {
        detectLanguage: _detectLanguage
    }
}


function sentiment(sentence, options) {
    return null;
}


/**
 * Individua la lingua di una data stringa.
 * @param {string} sentence     Stringa a cui individuare la lingua
 * @param {string} bias         Lingua in formato ISO2 a cui far tendere la ricerca (default: null)
 * @returns Codice ISO2 della lingua
 */
function _detectLanguage(sentence, bias=null) {
    const detections = lngDetector.detect(sentence);
    let detected_language = detections[0][0];

    if (bias) {
        const bias_language_detection = detections.find((detection) => detection[0] === bias); // Ricerca punteggio della lingua bias

        // Se il punteggio del bias è vicino a quello della lingua rilevata, si favorisce la lingua bias
        if (Math.abs(detections[0][1] - bias_language_detection[1]) <= BIAS_TOLLERANCE) {
            detected_language = bias_language_detection[0];
        }
    }

    return detected_language;
}