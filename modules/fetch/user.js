require("dotenv").config();
const axios = require('axios');
const { _mediaHandler } = require("./utils/mediaHandler");
const { _placeHandler } = require("./utils/placeHandler");
const { _normalizeDate } = require("./utils/normalizeDate");
const { _normalizeQuery } = require("./utils/normalizeQuery");

module.exports = {
    getTweetsByUser: getTweetsByUser,

    testing: {
        usr_fetch: _usr_fetch
    }
};

/**
 * Restituisce gli ultimi {quantity} tweet, o i {quantity} tweet nella pagina indicata dal pagination_token, di un utente dato il suo username, e l'eventuale token
 * per ottenere la pagina successiva con i prossimi {quantity} tweet
 * @param {string} username                     Username dell'utente
 * @param {string} pagination_token             Token della pagina da visualizzare (facoltativo)
 * @param {number} quantity                     Quantità di tweet da visualizzare (facoltativo, 10 di default)
 * @param {number} start_time                   Data minima dei tweet da ottenere (facoltativo)
 * @param {number} end_time                     Data massima dei tweet da ottenere (facoltativo)
 * @returns {Promise<[{id: number, name:string, username: string, pfp: string, text: string, time: string, likes: number, comments: number, retweets: number, 
 *          location: {id: string, full_name: string, country: string, coords: {long: number, lat: number}}, media: [{url: string, type: string}]}], next_token: string>}
 *          Array di tweet aventi ciascuno:
 *          ID del tweet, Nome dell'utente, Username (@), link alla foto profilo dell'utente, contenuto del tweet, data e ora, numero di like, numero di commenti, 
 *          numero di retweet, posizione del tweet (se abilitata), array di media (se presenti, altrimenti array vuoto)
 *          Token della prossima pagina da visualizzare (se presente, altrimenti stringa vuota)
 */
async function getTweetsByUser(username, pagination_token ="", quantity=10, start_time = '', end_time = '') {
    if (!username) {throw new Error('Username mancante');}

    //Chiamate alle API per ottenere l'utente e i relativi tweet
    const resUsr = await _usr_fetch(username);
    if (!resUsr) {throw new Error("Username non esistente o errore nel recuperare l'utente");}                    //Controlla se l'username esiste
    const resTwts = await _twt_fetch(username, pagination_token, quantity, start_time, end_time);
    if (!resTwts.data) {throw new Error('Pagination token non esistente o errore nel recuperare i tweet');}       //Controlla se il pagination token esiste    

    let page = {
        tweets: []
    };
    //Controlla se esiste il next_token, ovvero se è presente la prossima pagina di tweet da visualizzare, e lo assegna, altrimenti assegna stringa vuota
    page.next_token = resTwts.meta?.next_token ? resTwts.meta.next_token : "";

    //Inserisce i vari dati nell'array tweets, quello che verrà restituito dal modulo
    for(const tweet of resTwts.data) {
        
        //Controlla se il tweet ha la geolocalizzazione, se si, registra le informazioni del luogo nella variabile place
        let place = undefined;
        if (tweet.geo) { place = _placeHandler(resTwts.includes.places, tweet); }

        //Controlla se il tweet ha dei media, se si, registra i link dei media nell'array media
        let media = [];
        if (tweet.attachments) { media = _mediaHandler(resTwts.includes.media, tweet); }

        //Registrazione dei valori del tweet i
        page.tweets.push({
            "id": tweet.id,
            "name": resUsr.name,
            "username": resUsr.username,
            "pfp": resUsr.profile_image_url,
            "text":  tweet.text,
            "time": tweet.created_at,
            "likes": tweet.public_metrics.like_count,
            "comments": tweet.public_metrics.reply_count,
            "retweets": tweet.public_metrics.retweet_count,
            "location": place,
            "media": media
        });
    }
    return page;
}

/**
 * Chiamata alle API di Twitter per ottenere i dati di un utente dato il suo username
 * @param {string} username             Username dell'utente
 * @returns {Promise<Object>}           Dati vari dell'utente
 */
async function _usr_fetch(username) {
    //Normalizza lo username inserito
    username = _normalizeQuery(username);

    const options = {
        
        headers: {
            'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        },

        params: {
            'user.fields': 'name,username,profile_image_url'
        },

        validateStatus: () => true
    };
    const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, options);
    return response.data.data;
}

/**
 * Chiamata alle API di Twitter per ottenere i dati degli ultimi 10 tweet, o dei 10 tweet della pagina indicata dal 
 * pagination token (se presente), di un utente dato il suo ID
 * @param {number} username                       Username dell'utente
 * @param {number} pagination_token               Token della pagina da visualizzare
 * @param {number} quantity                       Quantità di tweet da visualizzare
 * @param {number} start_time                     Data minima dei tweet da ottenere (facoltativo)
 * @param {number} end_time                       Data massima dei tweet da ottenere (facoltativo)
 * @returns {Promise<Object[]>}                   Array di 10 tweet ciascuno con informazioni varie
 */
async function _twt_fetch(username, pagination_token = '', quantity = 10, start_time = '', end_time = '') {
    const limit = new Date('2006-03-26T00:00:01Z');
    const date = _normalizeDate(limit, start_time, end_time);
    username = _normalizeQuery(username);

    let options = {
        
        headers: {
            'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        },

        params: {
            query: `from:${username} -is:reply -is:retweet`,
            "max_results": quantity,                                            // Numero massimo Tweet per pagina
            "tweet.fields": "created_at,geo,text,public_metrics,attachments",   // Campi del Tweet
            "expansions": "geo.place_id,author_id,attachments.media_keys",      // Espansioni del campo Tweet
            "place.fields": "country,full_name,geo",                            // Campi della località
            "media.fields": "url,variants",                                     // Campi degli allegati
            "user.fields": "name,profile_image_url,username"                    // Campi dell'utente
        },

    };
    if (pagination_token != '') {
        options.params['pagination_token'] = pagination_token;
    }
    if (date.start_time != "") {
        options.params["start_time"] = date.start_time;
    }
    if (date.end_time != "") {
        options.params["end_time"] = date.end_time;
    }

    let response;
    try {
        response = await axios.get(`https://api.twitter.com/2/tweets/search/all`, options);
    } catch (err) {
        if (err.response?.data?.status === 429) {
            await new Promise(r => setTimeout(r, 1000));
            return _twt_fetch(username, pagination_token, quantity, start_time, end_time);
        }
        return null;
    }
    return response.data;
}