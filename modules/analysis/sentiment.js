const { detectLanguage } = require("./language.js");
const sentimentManager = new (require("node-nlp").SentimentManager)();
const sentimentMultilang = require("sentiment-multilang");


module.exports = {
    sentiment: sentiment
};


/**
 * Analizza il sentimento di una data frase in una determinata lingua. Se non specificata, si tenta di rilevare la lingua.
 * @param {string} sentence             Frase da analizzare
 * @param {Object} options              Opzioni di analisi
 * @param {string} options.language     Lingua della frase
 * @param {string} options.bias         Lingua a cui far tendere la rilevazione (se la lingua della frase è incerta)
 * @returns {Promise<{sentiment:string, score:number}>} Sentimento ("positive", "neutral", "negative") e score della frase
 */
async function sentiment(sentence, options={}) {
    let to_use_language;

    if (!options?.language && !options?.bias) { to_use_language = detectLanguage(sentence); }  // Rilevamento lingua senza indizzi
    else if (options.language) { to_use_language = options.language; }                          // Lingua fornita in input
    else { to_use_language = detectLanguage(sentence, options.bias); }                         // Rilevamento lingua con bias suggerito 

    const sentiment_data = await _sentimentAnalyzer(sentence, to_use_language);

    return sentiment_data;
}


/**
 * Analizza il sentimento di una frase utilizzando l'analizzatore più idoneo.
 * @param {string} sentence     Frase da analizzare
 * @param {string} language     Lingua della frase
 * @returns {Promise<{sentiment:string, score:number, language:string}>} Sentimento ("positive", "neutral", "negative"), score della frase e lingua utilizzata
 */
async function _sentimentAnalyzer(sentence, language) {
    let data;

    // Permette di scegliere analizzatori diversi in base alla lingua
    switch (language) {
        case "it": 
            data = sentimentMultilang(sentence, language);
            return { sentiment: data.vote, score: data.score, language: language };

        default: 
            data = await sentimentManager.process(language, sentence)
            return { sentiment: data.vote, score: data.score, language: language };
    }
}