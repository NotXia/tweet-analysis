require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs").promises;


module.exports = {
    sendTweet: sendTweet
}


const client = new TwitterApi({
    version: "2", extension: false,
    appKey: process.env.TWITTER_OAUTH_CONSUMER_KEY,
    appSecret: process.env.TWITTER_OAUTH_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_OAUTH_TOKEN,
    accessSecret: process.env.TWITTER_OAUTH_TOKEN_SECRET
});


/**
 * Gestisce l'upload di un media sui server di Twitter
 * @param {string} media_path   Percorso del media
 * @returns {Promise<string>} Id del media
 */
async function _uploadImage(media_path) {
    const image = await fs.readFile(media_path);
    const res = await client.v1.post("media/upload.json", { media: image }, { prefix: 'https://upload.twitter.com/1.1/' });
    
    return res.media_id_string;
}

/**
 * Gestisce la pubblicazione di un tweet con eventuali immagini
 * @param {string} text             Contenuto del tweet
 * @param {[string]} media_path     Percorso ai media del tweet
 * @returns {Promise<string>} Id del tweet
 */
async function sendTweet(text, media_path=[]) {
    let media_ids = [];

    // Upload media
    for (let media of media_path) { media_ids.push(await _uploadImage(media)); }

    // Pubblicazione tweet
    const res = await client.v2.post("tweets", { 
        text: text, 
        media: (media_ids.length > 0) ? { media_ids: media_ids } : undefined
    });

    return res.data.id;
}