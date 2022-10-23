require("dotenv").config();
const lngDetector = new (require("languagedetect"));
lngDetector.setLanguageType("iso2");
const sentimentManager = new (require("node-nlp").SentimentManager)();
var sentimentMultilang = require('sentiment-multilang');

const BIAS_TOLLERANCE = 0.1;


module.exports = sentiment;

/* istanbul ignore next */
if (process.env.NODE_ENV === "testing") {
    module.exports = {
        detectLanguage: _detectLanguage,
        sentiment: sentiment
    }
}


/**
 * Analizza il sentimento di una data frase in una determinata lingua. Se non specificata, si tenta di rilevare la lingua.
 * @param {string} sentence             Frase da analizzare
 * @param {Object} options              Opzioni di analisi
 * @param {string} options.language     Lingua della frase
 * @param {string} options.bias         Lingua a cui far tendere la rilevazione (se la lingua della frase è incerta)
 * @returns {{sentiment:string, score:number}} Sentimento ("positive", "neutral", "negative") e score della frase
 */
async function sentiment(sentence, options={}) {
    let to_use_language;

    if (!options?.language && !options?.bias) { to_use_language = _detectLanguage(sentence); }  // Rilevamento lingua senza indizzi
    else if (options.language) { to_use_language = options.language; }                          // Lingua fornita in input
    else { to_use_language = _detectLanguage(sentence, options.bias); }                         // Rilevamento lingua con bias suggerito 

    const sentiment_data = await _sentimentAnalyzer(sentence, to_use_language);

    return sentiment_data;
}


/**
 * Analizza il sentimento di una frase utilizzando l'analizzatore più idoneo.
 * @param {string} sentence     Frase da analizzare
 * @param {string} language     Lingua della frase
 * @returns {{sentiment:string, score:number}} Sentimento ("positive", "neutral", "negative") e score della frase
 */
async function _sentimentAnalyzer(sentence, language) {
    let data;

    // Permette di scegliere analizzatori diversi in base alla lingua
    switch (language) {
        case "it": 
            data = sentimentMultilang(sentence, language);
            return { sentiment: data.vote, score: data.score };

        default: 
            data = await sentimentManager.process(language, sentence)
            return { sentiment: data.vote, score: data.score };
    }
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