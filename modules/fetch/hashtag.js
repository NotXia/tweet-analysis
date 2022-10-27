require("dotenv").config();
const axios = require('axios');

module.exports = hashtagFetch;

async function hashtagFetch(hashtag) {
    hashtag = normalizeHashtag(hashtag);

    let tweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, {
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
    });

    // console.log(tweets.data.includes.media[0]);

    // console.log(tweets.data.data);
    // console.log(tweets.data.includes);

    return tweets;
}

function normalizeHashtag(hashtag) {
    if(hashtag.length !== 0) {
        if(hashtag[0] == '#') {
            hashtag = hashtag.slice(1);     // Se la stringa inizia con #, viene rimosso
        }
        hashtag = hashtag.toLowerCase();    // Imposta tutta la stringa a lower case

        return hashtag;
    }
}
