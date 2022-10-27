require("dotenv").config();
const axios = require('axios');

module.exports = getTweetsByHashtag;

/* istanbul ignore next */
if (process.env.NODE_ENV === "testing") {
    module.exports = {
        getTweetsByHashtag: getTweetsByHashtag,
        normalizeHashtag: _normalizeHashtag,
        hashtagFetch: _hashtagFetch
    }
}

async function getTweetsByHashtag(hashtag, pagination_token="") {
    tweets = _hashtagFetch(hashtag);

    console.log(tweets.data);

    return tweets;
}

async function _hashtagFetch(hashtag, pagination_token="") {
    hashtag = _normalizeHashtag(hashtag);

    let options = {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: {
            query: `#${hashtag}`,
            "max_results": 10,                                                  // Numero massimo Tweet per pagina
            "tweet.fields": "created_at,geo,text,public_metrics,attachments",   // Campi del Tweet
            "expansions": "author_id,attachments.media_keys",                   // Espansioni del campo Tweet
            "place.fields": "country,full_name",                                // Campi della località
            "media.fields": "url,variants",                                     // Campi degli allegati
            "user.fields": "name,profile_image_url,username"                    // Campi dell'utente
        }
    };
    if (pagination_token != "") {
        options.params["pagination_token"] = pagination_token;
    }

    let fetchedTweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, options);

    return fetchedTweets;
}

function _normalizeHashtag(hashtag) {
    if(hashtag.length !== 0) {
        if(hashtag[0] == '#') {
            hashtag = hashtag.slice(1);     // Se la stringa inizia con #, viene rimosso
        }
        hashtag = hashtag.toLowerCase();    // Imposta tutta la stringa a lower case

        return hashtag;
    }
}
