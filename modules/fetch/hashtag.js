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
    fetchedTweets = await _hashtagFetch(hashtag);

    // Pagina di dimensione max_results che contiene l'array di tweet
    let page = {
        tweets: []
    }

    let lastUser;

    for (let i = 0; i < fetchedTweets.data.data.length; i++) {
        // Gestione tweet data
        let tweetData = fetchedTweets.data.data[i];

        // Gestione utente autore
        let tweetUser = fetchedTweets.data.includes.users[i];
        if (tweetUser === undefined) {
            tweetUser = lastUser;
        }

        // Gestione geolocalizzazione
        let tweetPlace = fetchedTweets.data.includes.places, fullTweetPlace = "";
        if (tweetData.geo !== undefined) {
            for (let j = 0; j < tweetPlace.length; j++) {
                const place = tweetPlace[j];
                if (place.id == tweetData.geo.place_id) {
                    fullTweetPlace = place.full_name + ", " + place.country;
                }
            }
        }

        // Gestione allegati
        let tweetAttachments = fetchedTweets.data.includes.media, mediaArray = [];
        if (tweetData.attachments !== undefined) {
            for (let j = 0; j < tweetData.attachments.media_keys.length; j++) {
                const media_key = tweetData.attachments.media_keys[j];
                for (let k = 0; k < tweetAttachments.length; k++) {
                    const media = tweetAttachments[k];
                    
                    if (media_key == media.media_key) {
                        // Gestione video
                        if (media.type == "video") {
                            let found = false;
                            for (let l = 0; l < media.variants.length; l++) {
                                const video = media.variants[l];
                                if (video.includes(".mp4") && !found) {
                                    mediaArray.push(video.url);
                                    found = true;
                                }
                            }
                            if (!found) {
                                mediaArray.push(media.variants[0].url) // Se non trova alcun .mp4 inserisce il primo video tra le varianti
                            }
                        } else {
                            // Gestione foto e gif
                            mediaArray.push(media.url);
                        }
                    }
                }
            }
        }

        page.tweets.push({
            "name": tweetUser.name,
            "username": tweetUser.username,
            "pfp": tweetUser.profile_image_url,
            "text": tweetData.text,
            "likes": tweetData.public_metrics["like_count"],
            "comments": tweetData.public_metrics["reply_count"],
            "retweets": tweetData.public_metrics["retweet_count"],
            "location": fullTweetPlace,
            "media": mediaArray
        });

        lastUser = tweetUser;
    }

    return page;
}

async function _hashtagFetch(hashtag, pagination_token="") {
    hashtag = _normalizeHashtag(hashtag);

    let options = {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: {
            query: `#${hashtag} -is:retweet`,                                   // Filtra per hashtag e rimuove i retweet
            "max_results": 10,                                                  // Numero massimo Tweet per pagina
            "tweet.fields": "created_at,geo,text,public_metrics,attachments",   // Campi del Tweet
            "expansions": "geo.place_id,author_id,attachments.media_keys",      // Espansioni del campo Tweet
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
