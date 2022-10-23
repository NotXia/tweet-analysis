const sentiment = require("../modules/sentiment.js");


async function sentimentAnalysis(req, res) {
    let options = {}

    // Composizione opzioni
    if (req.query.lang) options.language = req.query.lang;
    if (req.query.bias) options.bias = req.query.bias;

    // Analisi del tweet
    const sentiment_result = await sentiment(req.query.tweet, options);

    res.status(200).json({ 
        sentiment: sentiment_result.sentiment,
        score: sentiment_result.score,
        language: sentiment_result.language
    });
}


module.exports = {
    sentimentAnalysis: sentimentAnalysis
};