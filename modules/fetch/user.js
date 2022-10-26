require("dotenv").config();
const axios = require('axios');


/**
 * Restituisce gli ultimi 100 tweet di un utente dato il suo username
 * @param {string} username             Username dell'utente
 * @returns {Promise[100]<{name:string, username: string, pfp: string, text: string, time: string, likes: number, comments: number, retweets: number, location: string}>} 
 *          Array di 100 tweet aventi ciascuno:
 *          Nome dell'utente, Username (@), link alla foto profilo dell'utente, contenuto del tweet, data e ora, numero di like, numero di commenti, numero di retweet
 *          e posizione del tweet (se abilitata, altrimenti stringa vuota)
 */
async function getTweetsByUser(username) {
    
    //Chiamate alle API per ottenere l'utente e i relativi tweet
    const resUsr = await usr_fetch(username);
    const resTwts = await twt_fetch(resUsr.id);

    let tweets = [];
    
    //Inserisce i vari dati nell'array tweets, quello che verrà restituito dal modulo
    for(let i = 0; i < resTwts.data.length; i++) {
        
        //Controlla se il tweet ha la geolocalizzazione, se si registra il nome del luogo nella variabile place,
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

        tweets.push({
            "name": resUsr.name,
            "username": resUsr.username,
            "pfp": resUsr.profile_image_url,
            "text":  resTwts.data[i].text,
            "time": resTwts.data[i].created_at,
            "likes": resTwts.data[i].public_metrics.like_count,
            "comments": resTwts.data[i].public_metrics.reply_count,
            "retweets": resTwts.data[i].public_metrics.retweet_count,
            "location": place
        });
    }
    return tweets;
}

/**
 * Chiamata alle API di Twitter per ottenere i dati di un utente dato il suo username
 * @param {string} username             Username dell'utente
 * @returns {Promise<{username: string, id: number, name: string, profile_image_url: string}>} 
 *          Username (@), ID dell'utente, Nome dell'utente, link alla foto profilo dell'utente
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
 * @returns {Promise<{Data[100]: {public_metrics: {retweet_count: number, reply_count: number, like_count: number, quote_count: number}, edit_history_tweet_ids[]: number, 
 *          text: string, id: number, created_at: string}, includes: {places[]: {country: string, full_name: string, id: number}}}>} 
 *          Array di 100 tweet aventi ciascuno:
 *          Numero di retweet, commenti, like e quote, IDs della cronologia delle modifiche, contenuto del tweet, ID del tweet, data e ora di pubblicazione
 *          Oggetto includes avente un array con la lista dei luoghi usati nei 100 tweet, avente ciascuno:
 *          Nome del paese, nome del luogo e ID del luogo
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
                'expansions': 'geo.place_id',
				'place.fields': 'country,full_name'
            }
        });
        return response.data;
    
    } catch (error) {
        console.log(error);
    }
}