require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");


module.exports = {
    getClient: getClient
}


let client = null;

function getClient() {
    if (!client) {
        try {
            client = new TwitterApi({
                version: "2", extension: false,
                appKey: process.env.TWITTER_OAUTH_CONSUMER_KEY,
                appSecret: process.env.TWITTER_OAUTH_CONSUMER_SECRET,
                accessToken: process.env.TWITTER_OAUTH_TOKEN,
                accessSecret: process.env.TWITTER_OAUTH_TOKEN_SECRET
            });
        }
        catch (err) {
            console.error(err);
            client = null;
        }
    }

    return client;
}
