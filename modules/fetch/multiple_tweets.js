module.exports = { multipleTweetsFetch: multipleTweetsFetch };

async function multipleTweetsFetch(fetcher, query, pagination_token="", quantity=10) {
    let fetchedTweets = [];

    while (quantity > 0) {
        try {
            if (quantity < 10) { quantity = 10; } 
            const tweets = await fetcher(query, pagination_token, quantity < 100 ? quantity : 100);
            fetchedTweets = fetchedTweets.concat(tweets.tweets);
            pagination_token = tweets.next_token;
            quantity -= 100;
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