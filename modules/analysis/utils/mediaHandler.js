module.exports = {
    _mediaHandler : _mediaHandler
}

/**
 * Cerca e restituisce gli URL dei media inclusi in un tweet
 * @param {Promise[]} media                     Array di tutti i media inclusi in tutti i tweet
 * @param {Promise<>} tweet                     tweet corrente di cui si vogliono trovare i media
 * @returns {[{url: string, type: string}]}     Array di URL e tipo corrispondenti ai media del tweet
 */
function _mediaHandler(media, tweet) {
    let tweetMedia = [];
    if (!tweet.attachments || !('media_keys' in tweet.attachments)) { return []; }
    
    //Per ogni media del tweet recupera l'url
    for(const md_key of tweet.attachments.media_keys) {

        const md  = media.find(md => md.media_key === md_key)
        if (!md) { continue; }

        let media_url;
        switch (md.type) {
            case 'animated_gif':
            case 'video':
                media_url = md.variants.find(video => video.url.includes('.mp4')).url;
                if (!media_url) { media_url = md.variants[0].url; }
                break;
            case 'photo':
                media_url = md.url;
                break;
            default:
                break;
        }

        if (media_url) { tweetMedia.push({url: media_url, type: md.type }); }
    }
    return tweetMedia;
}