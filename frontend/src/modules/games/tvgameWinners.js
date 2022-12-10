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