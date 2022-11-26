const { getCountRecentKeywordTweets } = require("../../modules/fetch/countRecent.js");

module.exports = { multipleTweetsFetch: multipleTweetsFetch };

/**
 * Restituisce gli ultimi tweet data una funzione di fetch e relativi parametri 
 * @param {function} fetcher                Funzione dalla quale fare fetch dei tweet
 * @param {string} query                    Query da ricercare
 * @param {string} pagination_token         Token della pagina successiva
 * @param {number} quantity                 Quantità di tweet da ricercare
 * @param {number} start_time               Data minima dei tweet da ottenere
 * @param {number} end_time                 Data massima dei tweet da ottenere
 * @returns Una pagina di dimensione richiesta di tweet
 */
async function multipleTweetsFetch(fetcher, query, pagination_token="", quantity=10, start_time='', end_time='') {
    let fetchedTweets = [];
    
    /* if (query[0] === '#') { 
        const max_tweets = await getCountRecentKeywordTweets(query);
        if (max_tweets < quantity) { quantity = max_tweets; }
    } */
    
    let remaining = quantity;
    while (remaining > 0) {
        try {
            const to_fetch_amount = remaining < 10 ? 10 : remaining;                                                                    // Quantità da richiedere normalizzata nell'intervallo [10, +inf[
            const tweets = await fetcher(query, pagination_token, to_fetch_amount < 500 ? to_fetch_amount : 500, start_time, end_time); // Viene richiamato il fetcher con query, pagination_token e quantità. La quantità è 100 se rimangono ancora più di 100 tweet da ricercare.
            fetchedTweets = fetchedTweets.concat(tweets.tweets);                                                                        // I tweet fetchati vengono concatenati a quelli precedenti
            pagination_token = tweets.next_token;                                                                                       // Viene aggiornato il pagination_token
            if (pagination_token === "") { break; }                                                                                     // Se non c'è una prossima pagina viene concluso il loop
            remaining -= tweets.tweets.length;                                                                                          // Viene ridotta la quantità della dimensione di tweet restituiti
        } catch (err) {
            pagination_token = "";
            break;
        }
    }

    return {
        "tweets": fetchedTweets,
        "next_token": pagination_token
    };
    
}