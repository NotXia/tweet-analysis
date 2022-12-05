require("dotenv").config();
const axios = require("axios");


module.exports = {
    getRepliesOf: getRepliesOf,
    getAllRepliesOf: getAllRepliesOf
}


/**
 * Estrae le risposte a un tweet
 * @param {string} tweet_id         Id del tweet
 * @param {string} next_token       Token della pagina successiva
 * @param {number} quantity         Quantità da estrarre
 * @returns {Promise<{replies:Object, next_token:string}>}  Le risposte e il token alla pagina successiva
 */
async function getRepliesOf(tweet_id, next_token, quantity=100) {
    // Estrazione risposte
    const tweet_data = ( await axios.get(`https://api.twitter.com/2/tweets/search/recent`, {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
        params: { 
            query: `conversation_id:${tweet_id} is:reply`,
            "max_results": quantity,
            "tweet.fields": "created_at,text,public_metrics",
            "expansions": "author_id",
            "user.fields": "name,profile_image_url,username",
            "pagination_token": next_token
        }
    }) ).data;

    // Formattazione risposte
    let replies = tweet_data?.data?.map((data) => {
        const author = tweet_data.includes.users.find(user => user.id === data.author_id);
        
        return {
            id: data.id,
            name: author.name,
            username: author.username,
            pfp: author.profile_image_url,
            text: data.text,
            time: data.created_at
        };
    });

    return {
        replies: replies ?? [],
        next_token: tweet_data.meta.next_token ?? ""
    };
}

/**
 * Estrae tutte le risposte a un tweet
 * @param {string} tweet_id  Id del tweet
 * @returns {Promise<[Object]>} Tutte le rispostea al tweet
 */
async function getAllRepliesOf(tweet_id) {
    let next_token = undefined;
    let all_replies = []

    do {
        try {
            let replies_data = await getRepliesOf(tweet_id, next_token);
    
            all_replies = all_replies.concat(replies_data.replies);
            next_token = replies_data.next_token;
        }
        catch (err) { break; }
    } while(next_token);

    return all_replies;
}