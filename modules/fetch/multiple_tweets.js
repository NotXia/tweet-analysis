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

    while (quantity > 0) {
        try {
            if (quantity < 10) { quantity = 10; }                                                                               // Imposta la quantità a 10, ovvero il minimo per le API di Twitter
            const tweets = await fetcher(query, pagination_token, quantity < 100 ? quantity : 100, start_time, end_time);       // Viene richiamato il fetcher con query, pagination_token e quantità. La quantità è 100 se rimangono ancora più di 100 tweet da ricercare.
            fetchedTweets = fetchedTweets.concat(tweets.tweets);                                                                // I tweet fetchati vengono concatenati a quelli precedenti
            pagination_token = tweets.next_token;                                                                               // Viene aggiornato il pagination_token
            quantity -= 100;                                                                                                    // Viene ridotta la quantità di 100 a prescindere vista la condizione del while
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