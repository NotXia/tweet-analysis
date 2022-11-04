require("dotenv").config();
const axios = require('axios');
const { _mediaHandler } = require("./utils/mediaHandler");
const { _normalizeQuery } = require("./utils/normalizeQuery");

module.exports = {
    getTweetsByUser: getTweetsByUser,

    testing: {
        usr_fetch: _usr_fetch
    }
};

/**
 * Restituisce gli ultimi 10 tweet, o i 10 tweet nella pagina indicata dal pagination_token, di un utente dato il suo username, e l'eventuale token
 * per ottenere la pagina successiva con i prossimi 10 tweet
 * @param {string} username                     Username dell'utente
 * @param {string} pagination_token             Token della pagina da visualizzare (facoltativo)
 * @returns {Promise<{tweets[10]: {id: number, name:string, username: string, pfp: string, text: string, time: string, likes: number, comments: number, retweets: number, 
 *          location: string, media[]: {url: string, type: string}}, next_token: string}>} 
 *          Array di 10 tweet aventi ciascuno:
 *          ID del tweet, Nome dell'utente, Username (@), link alla foto profilo dell'utente, contenuto del tweet, data e ora, numero di like, numero di commenti, 
 *          numero di retweet, posizione del tweet (se abilitata), array di media (se presenti)
 *          Token della prossima pagina da visualizzare (se presente, altrimenti stringa vuota)
 */
async function getTweetsByUser(username, pagination_token = '') {
    if (!username) {throw new Error('Username mancante');}
    
    //Chiamate alle API per ottenere l'utente e i relativi tweet
    const resUsr = await _usr_fetch(username);
    if (!resUsr) {throw new Error("Username non esistente o errore nel recuperare l'utente");}                    //Controlla se l'usarname esiste
    const resTwts = await _twt_fetch(resUsr.id, pagination_token);
    if (!resTwts.data) {throw new Error('Pagination token non esistente o errore nel recuperare i tweet');}       //Controlla se il pagination token esiste    

    let page = {
        tweets: []
    };
    //Controllo se esistono il next_token e il previous_token, ovvero se è presente la prossima o la precedente pagina di tweet da visualizzare, e li assegno
    page.next_token = resTwts.meta?.next_token ? resTwts.meta.next_token : "";

    //Inserisce i vari dati nell'array tweets, quello che verrà restituito dal modulo
    for(const tweet of resTwts.data) {
        
        //Controlla se il tweet ha la geolocalizzazione, se si, registra il nome del luogo nella variabile place
        let place = undefined;
        if (tweet.geo) { place = resTwts.includes.places.find(plc => plc.id === tweet.geo.place_id); }

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
 * @returns {Promise<>}                 Dati vari dell'utente
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
 * @param {number} userId                         ID dell'utente
 * @param {number} pagination_token               Token della pagina da visualizzare
 * @returns {Promise<>}                           Array di 10 tweet ciascuno con informazioni varie
 */
async function _twt_fetch(userId, pagination_token = '') {
        
    let options = {
        
        headers: {
            'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        },

        params: {
            'max_results': 10,
            'exclude': 'retweets',
            'tweet.fields': 'created_at,text,public_metrics',
            'expansions': 'geo.place_id,attachments.media_keys',
            'place.fields': 'country,full_name',
            'media.fields': 'url,variants'
        },

        validateStatus: () => true
    };
    if (pagination_token != '') {
        options.params['pagination_token'] = pagination_token;
    }
    const response = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, options);
    return response.data;
}