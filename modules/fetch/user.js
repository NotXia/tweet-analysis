require("dotenv").config();
const axios = require('axios');
const username = 'Luigi82724358';

async function usr_fetch(username) { //restituisce i dati dell'utente @username
    try {
        
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            
            headers: {
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
            },

            params: {
                'user.fields': 'name,username,profile_image_url'
            }
        });
        return response.data;
    
    } catch (error) {
        res.send(error);
    }
}
async function twt_fetch(userId) { //restituisce i tweet dell'utente con id userId
    try {
        
        const response = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
            
            headers: {
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
            },

            params: {
                'max_results': 100,
                'exclude': 'retweets',
                'tweet.fields': 'created_at,geo,text,public_metrics'
            }
        });
        return response.data;
    
    } catch (error) {
        res.send(error);
    }
}


usr_fetch(username)
    .then(function(response) {
        const user = response.data;
        twt_fetch(user.id)
            .then(function(response) {
                //res.json({'User': user, 'Tweets': response});
            });
    });