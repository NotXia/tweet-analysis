const { multipleTweetsFetch } = require("../modules/fetch/multiple_tweets.js");
const { getTweetsByHashtag } = require("../modules/fetch/hashtag.js");

async function tweetsByHashtag(req, res) {
    let tweets_response;

    try {
        tweets_response = await multipleTweetsFetch(getTweetsByHashtag, req.query.hashtag, req.query.pag_token, req.query.quantity, req.query.start_time, req.query.end_time);
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
    tweetsByHashtag: tweetsByHashtag
};