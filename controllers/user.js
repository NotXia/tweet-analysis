const { multipleTweetsFetch } = require("../modules/fetch/multiple_tweets.js");
const { getTweetsByUser } = require("../modules/fetch/user.js");
const TweetModel = require("../models/Tweets.js");

async function tweetsByUser(req, res) {
    let tweets_response;

    try {
        tweets_response = await multipleTweetsFetch(getTweetsByUser, req.query.user, req.query.pag_token, req.query.quantity, req.query.start_time, req.query.end_time);
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    res.status(200).json({
        tweets: tweets_response.tweets,
        next_token: tweets_response.next_token
    });

    // Caching tweet
    await Promise.all(tweets_response.tweets.map(async (tweet) => await TweetModel.cacheTweet(tweet).catch(() => {})));
}

module.exports = {
    tweetsByUser: tweetsByUser
};