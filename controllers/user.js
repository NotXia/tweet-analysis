const getTweetsByUser = require("../modules/fetch/user.js");

async function tweetsByUser(req, res) {
    let pag_token = '';
    let tweets_response;

    if (req.query.pag_token) { pag_token = req.query.pag_token; }

    try {
        tweets_response = await getTweetsByUser(req.query.user, pag_token);
    } catch (error) {
        res.sendStatus(500);
    }

    res.status(200).json({
        tweets: tweets_response.tweets,
        next_token: tweets_response.next_token
    });
}

module.exports = {
    tweetsByUser: tweetsByUser
};