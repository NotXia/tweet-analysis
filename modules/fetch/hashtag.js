require("dotenv").config();
const axios = require('axios');

module.exports = hashtagFetch;

async function hashtagFetch(hashtag) {
    // TODO: controllo dell'input (loLowerCase e togliere eventuale # a inizio stringa)
    try {
        let tweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: {
            query: `#${hashtag}`,
            "max_results": 10,
            "tweet.fields": "created_at,geo,text,public_metrics,attachments",
            "expansions": "author_id,attachments.media_keys",
            "place.fields": "country,full_name",
            "media.fields": "url,variants",
            "user.fields": "name,profile_image_url,username"
        }
        });

        console.log(tweets.data.includes.media[0]);

        // console.log(tweets.data.data);
        // console.log(tweets.data.includes);

        return tweets;
    } catch (error) {
        console.log(error);
    }
}
