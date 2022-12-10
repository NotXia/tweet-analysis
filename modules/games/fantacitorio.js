const Jimp = require('jimp');
const { getTweetsByKeyword } = require("../fetch/keyword.js");

module.exports = { getSquads: getSquads }

/**
 * Funzione che recupera i giocatori che si sono registrati al fantacitorio, insieme alla propria squadra
 * @return {Promise<[{tweet:Object, squad:string}]>} I tweet recuperati e il relativo link all'immagine con la propria squadra
 */
async function getSquads() {
    let pagination_token = "";
    let out = {};
    // Immagine di riferimento che verrà comparata con quelle nei tweet, per verificare quali immagini sono effettivamente squadre per il fantacitorio
    const img_sample = await Jimp.read('https://pbs.twimg.com/media/FgJ1OUDWQAEn9JT?format=jpg&name=medium');

    //do {
        try {
            let currentFetch = await getTweetsByKeyword("#fantacitorio", pagination_token, 100, '', '', true);

            for(const tweet of currentFetch.tweets) {
                let player = tweet.username;
                if (tweet.media.length > 0) {
                    for (const md of tweet.media) {

                        // Se il media è una foto, e il giocatore non ha ancora squadre registrate (considera quindi solo la prima squadra in un post, nel caso ce ne fosse
                        // più di una), esegue i controlli sulla foto
                        if (md.type === 'photo' && !out[player]) {
                            await Jimp.read(md.url)
                                .then(image => {
                                    image.autocrop(false);  //Rimuove eventuali bordi esterni nell'immagine

                                    // Se l'immagine nel tweet e l'immagine di riferimento sono estremamente simili, registra l'immagine come squadra sotto il nome del giocatore
                                    // che l'ha tweettata (essendo che la ricerca di tweet va da oggi verso il passato, verrà registrata solo l'ultima squadra trovata, ovvero
                                    // la prima pubblicata dal giocatore)
                                    if (Jimp.distance(image, img_sample) == 0) {    
                                        out[player] = {
                                            tweet: tweet,
                                            squad: md.url
                                        };
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }   
                    }
                }
            }

            pagination_token = currentFetch.next_token;
        }catch(err){
            console.log(err);
            //break;
        }
    //}while(pagination_token !== "");

    return Object.values(out);
}

getSquads().then((res) => {
    console.log(res);
});