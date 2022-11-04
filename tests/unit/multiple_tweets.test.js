require("dotenv").config();

const { getTweetsByHashtag } = require("../../modules/fetch/hashtag.js");
const { getTweetsByUser } = require("../../modules/fetch/user.js");
const { multipleTweetsFetch } = require("../../modules/fetch/multiple_tweets.js");

describe("Test ricerca tweet", function () {
    test("Ricerca 70 tweet per hashtag", async function () {
        const tweetsPage = await multipleTweetsFetch(getTweetsByHashtag, "reazioneacatena", "", 70);
        expect( tweetsPage.tweets.length ).toEqual(70);
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
        expect( tweetsPage.tweets.length ).toEqual(110);
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
        expect( tweetsPage.tweets.length ).toEqual(10); // Il minimo consentito è 10
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