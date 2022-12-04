require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");


module.exports = {
    deleteTweet: deleteTweet
}


const client = new TwitterApi({
    version: "2", extension: false,
    appKey: process.env.TWITTER_OAUTH_CONSUMER_KEY,
    appSecret: process.env.TWITTER_OAUTH_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_OAUTH_TOKEN,
    accessSecret: process.env.TWITTER_OAUTH_TOKEN_SECRET
});


/**
 * Gestisce la cancellazione di un tweet
 * @param {string} tweet_id     Id del tweet
 */
async function deleteTweet(tweet_id) {
    await client.v2.delete(`tweets/${encodeURIComponent(tweet_id)}`);
}