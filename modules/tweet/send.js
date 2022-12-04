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
 * @param {string|Buffer} media   Media da caricare
 * @returns {Promise<string>} Id del media
 */
async function _uploadImage(media) {
    let image = media;
    if (typeof media === "string") { image = await fs.readFile(media); } // Se è un percorso, legge il file

    const res = await client.v1.post("media/upload.json", { media: image }, { prefix: 'https://upload.twitter.com/1.1/' });
    
    return res.media_id_string;
}

/**
 * Gestisce la pubblicazione di un tweet con eventuali immagini
 * @param {string} text             Contenuto del tweet
 * @param {[string|Buffer]} medias  Media da caricare
 * @returns {Promise<string>} Id del tweet
 */
async function sendTweet(text, medias=[]) {
    let media_ids = [];

    // Upload media
    for (let media of medias) { media_ids.push(await _uploadImage(media)); }

    // Pubblicazione tweet
    const res = await client.v2.post("tweets", { 
        text: text, 
        media: (media_ids.length > 0) ? { media_ids: media_ids } : undefined
    });

    return res.data.id;
}