require("dotenv").config();
const axios = require('axios');

module.exports = { getCountRecentHashtagTweets: getCountRecentHashtagTweets }

async function getCountRecentHashtagTweets(hashtag) {
    let options = {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: {
            query: `${hashtag} has:hashtags -is:reply -is:retweet`,                                         // Filtra per hashtag e rimuove i retweet e le risposte
        },
    
        validateStatus: () => true
    };
    const countTweets = await axios.get(`https://api.twitter.com/2/tweets/counts/recent`, options);        // Restituisco il numero di tweet pubblicati negli ultimi 7 giorni
    
    return countTweets.data.meta.total_tweet_count;
}