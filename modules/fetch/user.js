require("dotenv").config();
const axios = require('axios');


/**
 * Restituisce gli ultimi 100 tweet, o i 100 tweet nella pagina indicata dal pagination_token, di un utente dato il suo username, e l'eventuale token
 * per ottenere la pagina successiva con i prossimi 100 tweet
 * @param {string} username                     Username dell'utente
 * @param {string} pagination_token             Token della pagina da visualizzare (facoltativo)
 * @returns {Promise<{tweets[100]: {name:string, username: string, pfp: string, text: string, time: string, likes: number, comments: number, retweets: number, 
 *          location: string, media[]: string}, next_token: string}>} 
 *          Array di 100 tweet aventi ciascuno:
 *          Nome dell'utente, Username (@), link alla foto profilo dell'utente, contenuto del tweet, data e ora, numero di like, numero di commenti, 
 *          numero di retweet, posizione del tweet (se abilitata, altrimenti stringa vuota), array di media (se presenti, altrimenti vuoto)
 *          Token della prossima pagina da visualizzare (se presente, altrimenti stringa vuota)
 */
async function getTweetsByUser(username, pagination_token = '') {
    
    //Chiamate alle API per ottenere l'utente e i relativi tweet
    const resUsr = await usr_fetch(username);
    let  resTwts;
    if (pagination_token == '') {
        resTwts = await twt_fetch(resUsr.id);
    } else {
        resTwts = await twt_fetch_nxtpage(resUsr.id, pagination_token);
    }

    let page = {
        tweets: []
    };
    try {
        page.next_token = resTwts.meta.next_token;
    } catch (error) {
        page.next_token = '';
    }

    //Inserisce i vari dati nell'array tweets, quello che verrà restituito dal modulo
    for(let i = 0; i < resTwts.data.length; i++) {
        
        //Controlla se il tweet ha la geolocalizzazione, se si, registra il nome del luogo nella variabile place,
        //altrimenti registra una stringa vuota
        let place = '';
        try {
            
            //Cicla i vari luoghi possibili e ne confronta l'ID con quello registrato nel tweet, fino a trovare un match
            for(let j = 0; j < resTwts.includes.places.length; j++) {
                if (resTwts.includes.places[j].id == resTwts.data[i].geo.place_id) {
                    place = resTwts.includes.places[j].full_name + ', ' + resTwts.includes.places[j].country;
                }
            }
        } catch (error) {
            place = '';
        }

        //Controlla se il tweet ha dei media, se si, registra i link dei media nell'array media,
        //altrimenti registra un array vuoto
        let media = [];
        try {
            
            //Per ogni media del tweet recupera l'url
            for(let k = 0; k < resTwts.data[i].attachments.media_keys.length; k++) {

                //Cicla i vari media possibili e ne confronta l'ID con quello del media k, fino a trovare un match
                for(let j = 0; j < resTwts.includes.media.length; j++) {
                    if (resTwts.includes.media[j].media_key == resTwts.data[i].attachments.media_keys[k]) {
                        if (resTwts.includes.media[j].type == 'video') {
                            media.push(resTwts.includes.media[j].variants[0].url);
                        } else {
                            media.push(resTwts.includes.media[j].url);
                        }
                    }
                }
            }
        } catch (error) {}

        //Registrazione dei valori del tweet i
        tweets.push({
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
async function usr_fetch(username) {
    
    try {    
        
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            },

            params: {
                'user.fields': 'name,username,profile_image_url'
            }
        });
        return response.data.data;
    
    } catch (error) {
        console.log(error);
    }
}

/**
 * Chiamata alle API di Twitter per ottenere i dati degli utlimi 100 tweet di un utente dato il suo ID
 * @param {number} userId               ID dell'utente
 * @returns {Promise<>}                 Array di 100 tweet ciascuno con informazioni varie
 */
async function twt_fetch(userId) {
    
    try {
        
        const response = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
            
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            },

            params: {
                'max_results': 100,
                'exclude': 'retweets',
                'tweet.fields': 'created_at,text,public_metrics',
                'expansions': 'geo.place_id,attachments.media_keys',
				'place.fields': 'country,full_name',
                'media.fields': 'url,variants'
            }
        });
        return response.data;
    
    } catch (error) {
        console.log(error);
    }
}

/**
 * Chiamata alle API di Twitter per ottenere i dati dei 100 tweet della pagina indicata dal pagination token di un utente dato il suo ID
 * @param {number} userId                       ID dell'utente
 * @param {string} pagination_token             Token della pagina da visualizzare
 * @returns {Promise<>}                         Array di 100 tweet ciascuno con informazioni varie
 */
async function twt_fetch_nxtpage(userId, pagination_token) {
    
    try {
        
        const response = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
            
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            },

            params: {
                'max_results': 100,
                'exclude': 'retweets',
                'tweet.fields': 'created_at,text,public_metrics',
                'expansions': 'geo.place_id,attachments.media_keys',
                'place.fields': 'country,full_name',
                'media.fields': 'url,variants',
                'pagination_token': pagination_token
            }
        });
        return response.data;
    
    } catch (error) {
        console.log(error);
    }
}