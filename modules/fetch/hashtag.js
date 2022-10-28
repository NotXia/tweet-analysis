require("dotenv").config();
const axios = require('axios');

module.exports = getTweetsByHashtag;

/* istanbul ignore next */
if (process.env.NODE_ENV === "testing") {
    module.exports = {
        getTweetsByHashtag: getTweetsByHashtag,
        hashtagFetch: _hashtagFetch,
        normalizeHashtag: _normalizeHashtag
    }
}

/**
 * Organizza i tweet interrogati.
 * @param {string} hashtag Hashtag da ricercare
 * @param {string} pagination_token Token della prossima pagina
 * @returns L'oggetto page che contiene un array di tweet e l'indicatore per la pagina successiva
 */
async function getTweetsByHashtag(hashtag, pagination_token="") {
    if (!hashtag) { throw new Error("Hashtag mancante"); }
    let fetchedTweets = await _hashtagFetch(hashtag, pagination_token);
    if (!fetchedTweets.data.data) { throw new Error("Pagination token non esistente o errore nel recuperare i tweet"); }

    // Pagina di dimensione max_results che contiene l'array di tweet
    let page = {
        tweets: []
    }

    page.next_token = fetchedTweets.data.meta?.next_token ? fetchedTweets.data.meta.next_token : "";

    // Gestione tweet data
    for (const tweetData of fetchedTweets.data.data) {       
        // Gestione utente autore
        let tweetUsers = fetchedTweets.data.includes.users;     // Lista utenti negli ultimi 10 tweet
        let tweetAuthor;                                        // Autore del tweet
        for (const user of tweetUsers) {
            if (user.id == tweetData.author_id) { tweetAuthor = user }
        }

        // Gestione geolocalizzazione
        let tweetPlace = fetchedTweets.data.includes.places, fullTweetPlace = "";
        if (tweetData.geo) {
            for (const place of tweetPlace) {
                if (place.id == tweetData.geo.place_id) {
                    fullTweetPlace = place.full_name + ", " + place.country;
                }
            }
        }

        // Gestione allegati
        let tweetAttachments = fetchedTweets.data.includes.media, mediaArray = [];
        if (tweetData.attchments && "media_keys" in tweetData.attachments) {
            for (const media_key of tweetData.attachments.media_keys) {             // Itera per tutti gli attachment del tweet i-esimo
                
                for (const media of tweetAttachments) {                             // Itera per tutti i media della pagina
                    
                    if (media_key == media.media_key) {
                        // Gestione video
                        if (media.type == "video") {
                            let found = false;
                            for (const video of media.variants) {
                                if (video.url.includes(".mp4") && !found) {
                                    mediaArray.push(video.url);
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                mediaArray.push(media.variants[0].url)              // Se non trova alcun .mp4 inserisce il primo video tra le varianti
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
            "name": tweetAuthor.name,
            "username": tweetAuthor.username,
            "pfp": tweetAuthor.profile_image_url,
            "text": tweetData.text,
            "time": tweetData.created_at,
            "likes": tweetData.public_metrics["like_count"],
            "comments": tweetData.public_metrics["reply_count"],
            "retweets": tweetData.public_metrics["retweet_count"],
            "location": fullTweetPlace,
            "media": mediaArray
        });

    }

    return page;
}

/**
 * Interroga le API di Twitter per ottenere una lista di tweet dato l'hashtag con i parametri indicati
 * @param {string} hashtag Hashtag da ricercare
 * @param {string} pagination_token Token della prossima pagina
 * @returns Lista di dimensione max_results tweet
 */
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
        },

        validateStatus: () => true
    };
    if (pagination_token != "") {
        options.params["pagination_token"] = pagination_token;
    }
    
    let fetchedTweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, options);

    return fetchedTweets;
}

/**
 * Normalizza l'hashtag in input, rimuovendo il carattere # da inizio stringa (se presente) ed eventuali spazi
 * @param {string} hashtag Hashtag da normalizzare
 * @returns L'hashtag normalizzato
 */
function _normalizeHashtag(hashtag) {
    if(hashtag.length !== 0) {
        if(hashtag[0] == '#') {
            hashtag = hashtag.slice(1);         // Se la stringa inizia con #, viene rimosso
        }
        hashtag = hashtag.replace(/\s/g, '');   // Rimuove tutti gli spazi

        return hashtag;
    }
}
