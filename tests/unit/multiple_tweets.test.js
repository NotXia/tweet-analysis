require("dotenv").config();
import nock from "nock";

const { getTweetsByKeyword } = require("../../modules/fetch/keyword.js");
const { getTweetsByUser } = require("../../modules/fetch/user.js");
const { multipleTweetsFetch } = require("../../modules/fetch/multiple_tweets.js");
const { getCountRecentKeywordTweets } = require("../../modules/fetch/countRecent.js");
const { generateParams, generateTweets, nockTwitterUsersByUsername } = require("../utils/tweet.js");


describe("Test conteggio tweet", function () {
    test("Ricerca 40 tweet per hashtag", async function () {
        const query = "#reazioneacatena";
        nock("https://api.twitter.com") 
            .get('/2/tweets/counts/all').query({query: `${query} -is:reply -is:retweet`})
            .reply(200, {
                "data": [
                    { "end": "2022-10-25T01:00:00.000Z", "start": "2022-10-25T00:00:00.000Z", "tweet_count": 10 },
                    { "end": "2022-10-25T03:00:00.000Z", "start": "2022-10-25T02:00:00.000Z", "tweet_count": 20 },
                    { "end": "2022-10-25T01:05:00.000Z", "start": "2022-10-25T00:04:00.000Z", "tweet_count": 30 }
                ],
                "meta": { "total_tweet_count": 60 }
            });
        const max_results = await getCountRecentKeywordTweets(query);
        expect(max_results).toEqual(60);
    });
});


describe("Test ricerca tweet", function () {
    test("Ricerca 1400 tweet per hashtag", async function () {
        const query = "#reazioneacatena";
        const batch1 = generateTweets(500);
        const batch2 = generateTweets(500);
        const batch3 = generateTweets(400);

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 500))
            .reply(200, batch1);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, batch1.meta.next_token, 500))
            .reply(200, batch2);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, batch2.meta.next_token, 400))
            .reply(200, batch3);
        const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 1400);
        expect( tweetsPage.tweets.length ).toEqual(1400);
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

    test("Ricerca 1500 tweet per hashtag ma ne esistono 1400", async function () {
        const query = "#reazioneacatena";
        const batch1 = generateTweets(500);
        const batch2 = generateTweets(500);
        const batch3 = generateTweets(400, true);

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 500))
            .reply(200, batch1);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, batch1.meta.next_token, 500))
            .reply(200, batch2);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, batch2.meta.next_token, 400))
            .reply(200, batch3);
        const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 1400);
        expect( tweetsPage.tweets.length ).toEqual(1400);
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
        expect( tweetsPage.next_token ).toEqual("");
    });

    test("Ricerca 1500 tweet per hashtag ma vengono restituiti 1400", async function () {
        const query = "#reazioneacatena";
        const batch1 = generateTweets(500);
        const batch2 = generateTweets(500);
        const batch3 = generateTweets(400);

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 500))
            .reply(200, batch1);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, batch1.meta.next_token, 500))
            .reply(200, batch2);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, batch2.meta.next_token, 500))
            .reply(200, batch3);
        const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 1500);
        expect( tweetsPage.tweets.length ).toEqual(1400);
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
        const batch1 = generateTweets(110);

        nockTwitterUsersByUsername("elonmusk");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 110))
            .reply(200, batch1 );
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
        const batch1 = generateTweets(10);

        nockTwitterUsersByUsername("elonmusk");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 10))
            .reply(200, batch1 );
        const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 5);
        expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(10); // Il minimo consentito ?? 10
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