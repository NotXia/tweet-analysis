require("dotenv").config();
const { checkTweetFormat } = require("../utils/tweet.js");

const { getTweetsByKeyword } = require("../../modules/fetch/keyword.js");
const { getTweetsByUser } = require("../../modules/fetch/user.js");
const { multipleTweetsFetch } = require("../../modules/fetch/multiple_tweets.js");
const { getCountRecentKeywordTweets } = require("../../modules/fetch/countRecent.js");


jest.setTimeout(60000);


describe("Test ricerca tweet", function () {
    test("Ricerca 40 tweet per hashtag", async function () {
        const query = "#reazioneacatena";
        const max_results = await getCountRecentKeywordTweets(query);
        const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 40);
        expect( tweetsPage.tweets.length ).toBeLessThanOrEqual(max_results);
        for (const tweet of tweetsPage.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca 110 tweet per utente", async function () {
        const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 110);
        expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(110);
        for (const tweet of tweetsPage.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca 5 tweet per utente", async function () {
        const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 5);
        expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(10); // Il minimo consentito è 10
        for (const tweet of tweetsPage.tweets) {
            checkTweetFormat(tweet);
        }
    });
});