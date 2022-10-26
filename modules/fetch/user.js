require("dotenv").config();
const axios = require('axios');


/**
 * Restituisce gli ultimi 100 tweet di un utente dato il suo username
 * @param {string} username             Username dell'utente
 * @returns {Promise[100]<{name:string, username: string, pfp: string, text: string, time: string, likes: number, comments: number, retweets: number}>} 
 *          Array di 100 tweet aventi ciascuno:
 *          Nome dell'utente, Username (@), link alla foto profilo dell'utente, contenuto del tweet, data e ora, numero di like, numero di commenti e numero di retweet 
 */
async function getTweetsByUser(username) {
    
    //Chiamate alle API per ottenere l'utente e i relativi tweet
    const resUsr = await usr_fetch(username);
    const resTwts = await twt_fetch(resUsr.id);

    let tweets = [];
    
    //Inserisce i vari dati nell'array tweets, quello che verrà restituito dal modulo
    for(let i = 0; i < resTwts.length; i++) {
        
        //NON ANCORA FUNZIONANTE | Dovrebbe controllare se il tweet ha la geolocalizzazione, se si fare una chiamata alle API di twitter per ottenere il luogo,
        //altrimenti inserire una stringa vuota
        /*let place;
        try {
            let place_id = resTwts[i].geo.place_id;
            let resPlc = await place_fetch(place_id);
            place = resPlc.full_name;
        } catch (error) {
            place = '';
        }*/

        tweets.push({
            "name": resUsr.name,
            "username": resUsr.username,
            "pfp": resUsr.profile_image_url,
            "text":  resTwts[i].text,
            "time": resTwts[i].created_at,
            "likes": resTwts[i].public_metrics.like_count,
            "comments": resTwts[i].public_metrics.reply_count,
            "retweets": resTwts[i].public_metrics.retweet_count,
            //"location": place
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
 * @returns {Promise[100]<{public_metrics: {retweet_count: number, reply_count: number, like_count: number, quote_count: number}, edit_history_tweet_ids[]: number, 
 *          text: string, id: number, created_at: string}>} 
 *          Array di 100 tweet aventi ciascuno:
 *          Numero di retweet, commenti, like e quote, IDs della cronologia delle modifiche, contenuto del tweet, ID del tweet, data e ora di pubblicazione
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
                'tweet.fields': 'created_at,geo,text,public_metrics'
            }
        });
        return response.data.data;
    
    } catch (error) {
        console.log(error);
    }
}

/**
 * Chiamata alle API di Twitter per ottenere i dati di un luogo dato il suo ID
 * @param {number} placeId              ID del luogo
 * @returns {Promise<>}                 Dati vari sul luogo
 */
async function place_fetch(placeId) {
    try {
        
        const response = await axios.get(`https://api.twitter.com/1.1/geo/id/${placeId}`, {
            
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            }

        });
        return response.data.data;
    
    } catch (error) {
        console.log(error);
    }
}