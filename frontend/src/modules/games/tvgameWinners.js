import moment from "moment";


/**
 * Restituisce i tweet degli utenti che hanno indovinato la parola vincente
 * @param {[Object]} players        Lista dei tweet dei giocatori
 * @param {string} winning_word     Parola vincente
 * @returns {[Object]}  Lista dei tweet dei giocatori che hanno indovinato
 */
export function getWinners(tweets, winning_word) {
    if (winning_word === "") { return []; }

    let winners = [];
    let winner_username = {}; // Per tenere traccia di chi è già nella lista dei vincitori
    
    tweets.forEach((tweet) => {
        if (tweet.word.toUpperCase() === winning_word.toUpperCase()) {
            if (!winner_username[tweet.tweet.username]) {
                winners.push(tweet.tweet);
                winner_username[tweet.tweet.username] = true;
            }
        }
    });

    winners.reverse();
    return winners;
}

/**
 * Restituisce i giocatori più vincenti (almeno 2 indovinate) di una dato intervallo temporale
 * @param {string} curr_date            Data di inizio
 * @param {string} end_date             Data di fine
 * @param {function} tweet_fetcher             Funzione per estrarre i tentativi
 * @param {function} winning_word_fetcher      Funzione per estrarre la parola vincente 
 * @returns {Promise<[{tweet: Object, times: number}]>} Il numero di volte che l'utente ha vinto e un tweet di quell'utente
 */
export async function getMostWinningFrom(curr_date, end_date, tweet_fetcher, winning_word_fetcher) {
    curr_date = moment.utc(curr_date).startOf("day");
    end_date = moment.utc(end_date).startOf("day");

    let all_winners = {};               // Associa username al numero di vittorie
    let winner_reference_tweet = {};    // Associa username a un tweet di quell'utente

    while (curr_date.isAfter(end_date)) {
        try {
            const tweets_data = await tweet_fetcher(curr_date);
            const winning_word = await winning_word_fetcher(curr_date);
    
            const winners = getWinners(tweets_data.tweets, winning_word.word);
            winners.forEach((winner_tweet) => {
                if (!all_winners[winner_tweet.username]) { all_winners[winner_tweet.username] = 0; }
                all_winners[winner_tweet.username]++;

                winner_reference_tweet[winner_tweet.username] = winner_tweet;
            })
        }
        catch (err) { /* Volutamente vuoto */ }
        curr_date = curr_date.subtract(1, "days");
    }

    let most_winning = Object.keys(all_winners).filter((winner_username) => all_winners[winner_username] > 1); // Estrae chi ha vinto più volte
    most_winning = most_winning.map((winner_username) => ({
        tweet: winner_reference_tweet[winner_username],
        times: all_winners[winner_username]
    }));
    most_winning.sort((w1, w2) => w2.times - w1.times);

    return most_winning;
}