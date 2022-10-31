const { sentiment } = require("../modules/analysis/sentiment.js");
const { removeStopWords } = require("../modules/analysis/stopwords.js");


async function sentimentAnalysis(req, res) {
    let options = {};
    let sentiment_result;

    // Composizione opzioni
    if (req.query.lang) options.language = req.query.lang;
    if (req.query.bias) options.bias = req.query.bias;
    
    try {
        // Analisi del tweet
        sentiment_result = await sentiment(req.query.tweet, options);
    }
    catch (err) {
        return res.sendStatus(500);
    }

    return res.status(200).json({ 
        sentiment: sentiment_result.sentiment,
        score: sentiment_result.score,
        language: sentiment_result.language
    });
}

async function stopwordsRemoval(req, res) {
    let options = {};
    let sentence_no_stopwords;

    // Composizione opzioni
    if (req.query.lang) { options.language = req.query.lang; }
    if (req.query.bias) { options.bias = req.query.bias; }
    
    try {
        // Rimozione stop words
        sentence_no_stopwords = removeStopWords(req.query.tweet, options);
    }
    catch (err) {
        return res.sendStatus(500);
    }

    return res.status(200).json({ 
        sentence: sentence_no_stopwords
    });
}


module.exports = {
    sentimentAnalysis: sentimentAnalysis,
    stopwordsRemoval: stopwordsRemoval
};
