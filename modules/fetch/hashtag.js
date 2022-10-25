require("dotenv").config();
const axios = require('axios');

module.exports = hashtagFetch;

async function hashtagFetch(hashtag) {
    // TODO: controllo dell'input (loLowerCase e togliere eventuale # a inizio stringa)    
    let tweets = await axios({
        method: "get",
        url: `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent("#")}${hashtag}`,
        headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` }
    });

    // console.log(tweets.data.data[0]);

    return tweets;
}
