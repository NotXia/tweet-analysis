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

export async function getMostWinningFrom(curr_date, end_date, tweet_fetcher, winning_word_fetcher) {
    curr_date = moment.utc(curr_date).startOf("day");
    end_date = moment.utc(end_date).startOf("day");

    let all_winners = {};
    let winner_reference_tweet = {};

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
        catch (err) {  }
        curr_date = curr_date.subtract(1, "days")
    }

    let most_winning = Object.keys(all_winners).filter((winner_username) => all_winners[winner_username] > 1);
    most_winning = most_winning.map((winner_username) => ({
        tweet: winner_reference_tweet[winner_username],
        times: all_winners[winner_username]
    }));
    most_winning.sort((w1, w2) => w2.times - w1.times);

    return most_winning;
}