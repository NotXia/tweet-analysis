require("dotenv").config();
const axios = require('axios');
const { _mediaHandler } = require("./utils/mediaHandler");
const { _normalizeQuery } = require("./utils/normalizeQuery");

module.exports = {
    getTweetsByHashtag: getTweetsByHashtag,

    testing : {
        normalizeHashtag: _normalizeQuery
    }
};

/**
 * Organizza i tweet interrogati.
 * @param {string} hashtag Hashtag da ricercare
 * @param {string} pagination_token Token della prossima pagina
 * @param {number} quantity Numero di tweet da ricercare
 * @returns L'oggetto page che contiene un array di tweet e l'indicatore per la pagina successiva
 */
async function getTweetsByHashtag(hashtag, pagination_token="", quantity=10) {
    if (!hashtag) { throw new Error("Hashtag mancante"); }
    let fetchedTweets = await _hashtagFetch(hashtag, pagination_token, quantity);
    if (!fetchedTweets.data.data) { throw new Error("Pagination token non esistente o errore nel recuperare i tweet"); }

    // Pagina di dimensione max_results che contiene l'array di tweet
    let page = {
        tweets: []
    }

    page.next_token = fetchedTweets.data.meta?.next_token ? fetchedTweets.data.meta.next_token : "";

    // Gestione tweet data
    for (const tweetData of fetchedTweets.data.data) {  
        // Gestione utente autore
        let tweetUsers = fetchedTweets.data.includes.users;                            // Lista utenti negli ultimi 10 tweet                                        
        const tweetAuthor = tweetUsers.find(user => user.id === tweetData.author_id);  // Ricerca Autore del tweet

        // Gestione geolocalizzazione
        let searchedPlace = undefined;
        if (tweetData.geo) {
            let tweetPlaces = fetchedTweets.data.includes.places;
            searchedPlace = tweetPlaces.find(place => place.id === tweetData.geo.place_id);
        }

        // Gestione allegati
        let tweetAttachments = fetchedTweets.data.includes.media;
        let mediaArray = _mediaHandler(tweetAttachments, tweetData);

        page.tweets.push({
            "id": tweetData.id,
            "name": tweetAuthor.name,
            "username": tweetAuthor.username,
            "pfp": tweetAuthor.profile_image_url,
            "text": tweetData.text,
            "time": tweetData.created_at,
            "likes": tweetData.public_metrics["like_count"],
            "comments": tweetData.public_metrics["reply_count"],
            "retweets": tweetData.public_metrics["retweet_count"],
            "location": searchedPlace,
            "media": mediaArray
        });

    }

    return page;
}

/**
 * Interroga le API di Twitter per ottenere una lista di tweet dato l'hashtag con i parametri indicati
 * @param {string} hashtag Hashtag da ricercare
 * @param {string} pagination_token Token della prossima pagina
 * @param {number} quantity Numero di tweet da ricercare
 * @returns Lista di dimensione max_results tweet
 */
async function _hashtagFetch(hashtag, pagination_token="", quantity=10) {
    hashtag = _normalizeQuery(hashtag);

    let options = {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: {
            query: `#${hashtag} -is:reply -is:retweet`,                         // Filtra per hashtag e rimuove i retweet
            "max_results": quantity,                                            // Numero massimo Tweet per pagina
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
    
    const fetchedTweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, options);

    return fetchedTweets;
}