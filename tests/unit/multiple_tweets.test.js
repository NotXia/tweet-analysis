require("dotenv").config();
import nock from "nock";

const { getTweetsByKeyword } = require("../../modules/fetch/keyword.js");
const { getTweetsByUser } = require("../../modules/fetch/user.js");
const { multipleTweetsFetch } = require("../../modules/fetch/multiple_tweets.js");
const { getCountRecentKeywordTweets } = require("../../modules/fetch/countRecent.js");
const { generateParams, generateTweets, countTweets } = require("../utils/tweet.js");

describe("Test ricerca tweet", function () {
    test("Ricerca 40 tweet per hashtag", async function () {
        const query = "#reazioneacatena";
        nock("https://api.twitter.com") 
            .get('/2/tweets/counts/all').query({query: `%23reazioneacatena%20-is%3Areply%20-is%3Aretweet`})
            .reply(200, {
                "data": [
                    {
                      "end": "2022-10-25T01:00:00.000Z",
                      "start": "2022-10-25T00:00:00.000Z",
                      "tweet_count": 10
                    },
                    {
                        "end": "2022-10-25T03:00:00.000Z",
                        "start": "2022-10-25T02:00:00.000Z",
                        "tweet_count": 20
                    },
                    {
                        "end": "2022-10-25T01:05:00.000Z",
                        "start": "2022-10-25T00:04:00.000Z",
                        "tweet_count": 30
                    }
                ],
                "meta": {
                    "total_tweet_count": 60
                }
            });
        const max_results = await getCountRecentKeywordTweets(query);
        
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query))
            .reply(200, generateTweets(40) );
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
    // test("Ricerca 99999 tweet per hashtag", async function () {
    //     nock("https://api.twitter.com")
    //         .get('/2/tweets/search/all').query(generateParams("#reazioneacatena"))
    //         .reply(200, generateTweets(99999) );
    //     const query = "#reazioneacatena";
    //     const max_results = await getCountRecentKeywordTweets(query);
    //     const tweetsPage = await multipleTweetsFetch(getTweetsByKeyword, query, "", 99999);
    //     expect( tweetsPage.tweets.length ).toBeLessThanOrEqual(max_results);
    //     for (const tweet of tweetsPage.tweets) {
    //         expect( tweet.name ).toBeDefined();
    //         expect( tweet.username ).toBeDefined();
    //         expect( tweet.pfp ).toBeDefined();
    //         expect( tweet.text ).toBeDefined();
    //         expect( tweet.time ).toBeDefined();
    //         expect( tweet.likes ).toBeDefined();
    //         expect( tweet.comments ).toBeDefined();
    //         expect( tweet.retweets ).toBeDefined();
    //         expect( tweet.media ).toBeDefined();
    //     }
    // });

    // test("Ricerca 110 tweet per utente", async function () {
    //     nock("https://api.twitter.com")
    //         .get('/2/tweets/search/all').query(generateParams("from:elonmusk"))
    //         .reply(200, generateTweets(110) );
    //     const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 110);
    //     expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(110);
    //     for (const tweet of tweetsPage.tweets) {
    //         expect( tweet.name ).toBeDefined();
    //         expect( tweet.username ).toBeDefined();
    //         expect( tweet.pfp ).toBeDefined();
    //         expect( tweet.text ).toBeDefined();
    //         expect( tweet.time ).toBeDefined();
    //         expect( tweet.likes ).toBeDefined();
    //         expect( tweet.comments ).toBeDefined();
    //         expect( tweet.retweets ).toBeDefined();
    //         expect( tweet.media ).toBeDefined();
    //     }
    // });

    // test("Ricerca 5 tweet per utente", async function () {
    //     nock("https://api.twitter.com")
    //         .get('/2/tweets/search/all').query(generateParams("from:elonmusk"))
    //         .reply(200, generateTweets(5) );
    //     const tweetsPage = await multipleTweetsFetch(getTweetsByUser, "elonmusk", "", 5);
    //     expect( tweetsPage.tweets.length ).toBeGreaterThanOrEqual(10); // Il minimo consentito è 10
    //     for (const tweet of tweetsPage.tweets) {
    //         expect( tweet.name ).toBeDefined();
    //         expect( tweet.username ).toBeDefined();
    //         expect( tweet.pfp ).toBeDefined();
    //         expect( tweet.text ).toBeDefined();
    //         expect( tweet.time ).toBeDefined();
    //         expect( tweet.likes ).toBeDefined();
    //         expect( tweet.comments ).toBeDefined();
    //         expect( tweet.retweets ).toBeDefined();
    //         expect( tweet.media ).toBeDefined();
    //     }
    // });
});