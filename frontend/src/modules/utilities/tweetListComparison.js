/**
 * Confronta due liste di tweet (formato delle API)
 * @param {[{id:number, any}]} tweet_list1      Lista da confrontare
 * @param {[{id:number, any}]} tweet_list2      Lista da confrontare
 * @returns {boolean} true se uguali, false altrimenti
 */
export function sameTweets(tweet_list1, tweet_list2) {
    if (tweet_list1.length != tweet_list2.length) { return false; }

    for (let i=tweet_list1.length-1; i>=0; i--) {
        if (tweet_list1[i].id != tweet_list2[i].id) { return false; }
    }

    return true;
}