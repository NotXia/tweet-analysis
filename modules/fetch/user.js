require("dotenv").config();
const axios = require('axios');

module.exports = getTweetsByUser;

/* istanbul ignore next */
if (process.env.NODE_ENV === "testing") {
    module.exports = {
        getTweetsByUser: getTweetsByUser,
        usr_fetch: _usr_fetch,
        twt_fetch: _twt_fetch,
    }
}

/**
 * Restituisce gli ultimi 10 tweet, o i 10 tweet nella pagina indicata dal pagination_token, di un utente dato il suo username, e l'eventuale token
 * per ottenere la pagina successiva con i prossimi 10 tweet
 * @param {string} username                     Username dell'utente
 * @param {string} pagination_token             Token della pagina da visualizzare (facoltativo)
 * @returns {Promise<{tweets[10]: {name:string, username: string, pfp: string, text: string, time: string, likes: number, comments: number, retweets: number, 
 *          location: string, media[]: string}, next_token: string}>} 
 *          Array di 10 tweet aventi ciascuno:
 *          Nome dell'utente, Username (@), link alla foto profilo dell'utente, contenuto del tweet, data e ora, numero di like, numero di commenti, 
 *          numero di retweet, posizione del tweet (se abilitata, altrimenti stringa vuota), array di media (se presenti, altrimenti vuoto)
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
    for(let i = 0; i < resTwts.data.length; i++) {
        
        //Controlla se il tweet ha la geolocalizzazione, se si, registra il nome del luogo nella variabile place,
        //altrimenti registra una stringa vuota
        let place = '';
        if (resTwts.data[i].geo) {
            //Cicla i vari luoghi possibili e ne confronta l'ID con quello registrato nel tweet, fino a trovare un match
            for(let j = 0; j < resTwts.includes.places.length; j++) {
                if (resTwts.includes.places[j].id == resTwts.data[i].geo.place_id) {
                    place = resTwts.includes.places[j].full_name + ', ' + resTwts.includes.places[j].country;
                }
            }
        }

        //Controlla se il tweet ha dei media, se si, registra i link dei media nell'array media,
        //altrimenti registra un array vuoto
        let media = [];
        if (resTwts.data[i].attachments) {
            //Per ogni media del tweet recupera l'url
            for(let k = 0; k < resTwts.data[i].attachments.media_keys.length; k++) {

                //Cicla i vari media possibili e ne confronta l'ID con quello del media k, fino a trovare un match
                for(let j = 0; j < resTwts.includes.media.length; j++) {
                    if (resTwts.includes.media[j].media_key == resTwts.data[i].attachments.media_keys[k]) {
                        if (resTwts.includes.media[j].type == 'video') {
                            //Se il media è un video, cerca il file con estensione .mp4
                            let found = false;
                            for (let s = 0; s < resTwts.includes.media[j].variants.length; s++) {
                                if (resTwts.includes.media[j].variants[s].url.includes('.mp4')) {
                                    media.push(resTwts.includes.media[j].variants[s].url);
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                media.push(resTwts.includes.media[j].variants[0].url);
                            }
                        } else {
                            media.push(resTwts.includes.media[j].url);
                        }
                    }
                }
            }
        }

        //Registrazione dei valori del tweet i
        page.tweets.push({
            "name": resUsr.name,
            "username": resUsr.username,
            "pfp": resUsr.profile_image_url,
            "text":  resTwts.data[i].text,
            "time": resTwts.data[i].created_at,
            "likes": resTwts.data[i].public_metrics.like_count,
            "comments": resTwts.data[i].public_metrics.reply_count,
            "retweets": resTwts.data[i].public_metrics.retweet_count,
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