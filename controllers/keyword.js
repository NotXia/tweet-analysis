const { multipleTweetsFetch } = require("../modules/fetch/multiple_tweets.js");
const { getTweetsByKeyword } = require("../modules/fetch/keyword.js");

async function tweetsByKeyword(req, res) {
    let tweets_response;

    try {
        tweets_response = await multipleTweetsFetch(getTweetsByKeyword, req.query.keyword, req.query.pag_token, req.query.quantity, req.query.start_time, req.query.end_time);
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    res.status(200).json({
        tweets: tweets_response.tweets,
        next_token: tweets_response.next_token
    });
}

module.exports = {
    tweetsByKeyword: tweetsByKeyword
};