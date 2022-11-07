require("dotenv").config();
const axios = require('axios');
const { _mediaHandler } = require("./utils/mediaHandler");
const { _normalizeDate } = require("./utils/normalizeDate");
const { _normalizeQuery } = require("./utils/normalizeQuery");
const moment = require('moment');
moment().format();

module.exports = {
    getTweetsByKeyword: getTweetsByKeyword,

    testing : {
        normalizeKeyword: _normalizeQuery
    }
};

/**
 * Organizza i tweet interrogati.
 * @param {string} keyword Parola chiave da ricercare (può essere anche un hashtag)
 * @param {string} pagination_token Token della prossima pagina
 * @param {number} quantity Numero di tweet da ricercare
 * @param {number} start_time Data minima dei tweet da ottenere
 * @param {number} end_time Data massima dei tweet da ottenere
 * @returns L'oggetto page che contiene un array di tweet e l'indicatore per la pagina successiva
 */
async function getTweetsByKeyword(keyword, pagination_token="", quantity=10, start_time = '', end_time = '') {
    if (!keyword) { throw new Error("Parola chiave mancante"); }
    let fetchedTweets = await _keywordFetch(keyword, pagination_token, quantity, start_time, end_time);
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
 * Interroga le API di Twitter per ottenere una lista di tweet data una parola chiave con i parametri indicati
 * @param {string} keyword Parola chiave da ricercare (può essere anche un hashtag)
 * @param {string} pagination_token Token della prossima pagina
 * @param {number} quantity Numero di tweet da ricercare
 * @param {number} start_time Data minima dei tweet da ottenere
 * @param {number} end_time Data massima dei tweet da ottenere
 * @returns Lista di dimensione richiesta tweet se possibile, altrimenti restituisce il massimo numero disponibile.
 */
async function _keywordFetch(keyword, pagination_token="", quantity=10, start_time = '', end_time = '') {
    keyword = _normalizeQuery(keyword);

    // Controlla che le date siano nel range limite di twitter (gli ultimi 7 giorni)
    let today = new Date();
    let aweekago = new Date(moment(today).subtract(7, 'days'));
    const date = _normalizeDate(aweekago, start_time, end_time);

    let options = {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: {
            query: `${keyword} -is:reply -is:retweet`,                          // Filtra per parola chiave e rimuove i retweet e le risposte
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
    if (date.start_time != "") {
        options.params["start_time"] = date.start_time;
    }
    if (date.end_time != "") {
        options.params["end_time"] = date.end_time;
    }
    
    const fetchedTweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, options);

    return fetchedTweets;
}