require("dotenv").config();

const { getTweetsByKeyword } = require("../../modules/fetch/keyword.js");
const { getTweetsByUser } = require("../../modules/fetch/user.js");
const { multipleTweetsFetch } = require("../../modules/fetch/multiple_tweets.js");
const { getCountRecentKeywordTweets } = require("../../modules/fetch/countRecent.js");

describe("Test ricerca tweet", function () {
    test("Ricerca 40 tweet per hashtag", async function () {
        const query = "#reazioneacatena";
        const max_results = await getCountRecentKeywordTweets(query);
        const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 40);
        expect( tweetsPage.tweets.length ).toBeLessThanOrEqual(max_results);
        for (const tweet of tweetsPage.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
        }
    });

    /**
     * Questo test ricerca un numero esagerato di tweet negli ultimi 7 giorni, che non esistono. Restituisce quindi tutti i tweet negli ultimi 7 giorni
     */
    test("Ricerca 99999 tweet per hashtag", async function () {
        const query = "#reazioneacatena";
        const max_results = await getCountRecentKeywordTweets(query);
        const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 99999);
        expect( tweetsPage.tweets.length ).toBeLessThanOrEqual(max_results);
        for (const tweet of tweetsPage.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
        }
    });

    test("Ricerca 110 tweet per utente", async function () {
        const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 110);
        expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(110);
        for (const tweet of tweetsPage.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
        }
    });

    test("Ricerca 5 tweet per utente", async function () {
        const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 5);
        expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(10); // Il minimo consentito è 10
        for (const tweet of tweetsPage.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
        }
    });
});