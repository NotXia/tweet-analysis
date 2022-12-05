require("dotenv").config();
const { getClient } = require("./twitter_oauth.js");


module.exports = {
    deleteTweet: deleteTweet
}


/**
 * Gestisce la cancellazione di un tweet
 * @param {string} tweet_id     Id del tweet
 */
async function deleteTweet(tweet_id) {
    const client = getClient();
    await client.v2.delete(`tweets/${encodeURIComponent(tweet_id)}`);
}