const { getTweetsByHashtag } = require("../modules/fetch/hashtag.js");

async function tweetsByHashtag(req, res) {
    let tweets_response;

    try {
        tweets_response = await getTweetsByHashtag(req.query.hashtag, req.query.pag_token);
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