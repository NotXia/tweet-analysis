const Jimp = require('jimp');
const { getTweetsByKeyword } = require("../fetch/keyword.js");

module.exports = { getSquads: getSquads }

async function getSquads() {
    let pagination_token = "";
    let out = [];
    //do {
        try {
            let currentFetch = await getTweetsByKeyword("#fantacitorio", pagination_token, 10);
            
            for(const tweet of currentFetch.tweets) {                     //Per tutti i tweet ricevuti controlla se sono qualificabili al gioco
                if (tweet.media.length > 0) {

                    for (const md of tweet.media) {
                        if (md.type === 'photo') {
                            await Jimp.read(md.url)
                                .then(image => {
                                    if (image.bitmap.height == 512 && image.bitmap.width == 1024) {
                                        out.push({
                                            tweet: tweet,
                                            img: md.url
                                        });
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }   
                    }
                }
            }

            //pagination_token = currentFetch.next_token;
        }catch(err){
            console.log(err);
            //break;
        }
    //}while(pagination_token !== "");

    return out;
}

getSquads().then((res) => {
    console.log(res);
});