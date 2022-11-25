require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
const { generateParams, generateTweets } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { getCountRecentKeywordTweets } = require("../../modules/fetch/countRecent.js");

let curr_session = session(app);

let pagination_token;

let today = new Date();
today.setHours(23,59,59,999);
let limit = new Date();
limit = new Date(moment(limit).subtract(7, 'days'));
let future = new Date();
future = new Date(moment(future).add(7, 'days'));
let date1 = new Date();
date1 = new Date(moment(date1).subtract(5, 'days'));
date1.setHours(0,0,0,0);
let date2 = new Date();
date2 = new Date(moment(date2).subtract(1, 'days'));
date2.setHours(23,59,59,999);

describe("Richieste corrette a /tweets/keyword", function () {
    test("Tweet dato solo hashtag", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#leredita"))
            .reply(200, generateTweets(10) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#leredita" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.likes ).not.toBeNaN();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.comments ).not.toBeNaN();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.retweets ).not.toBeNaN();
            expect( tweet.media ).toBeDefined();
            expect(Array.isArray(tweet.media)).toBe(true);
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
        expect( res.body.next_token ).toBeDefined();
        pagination_token = res.body.next_token;
    });

    test("Tweet dato hashtag e pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#leredita", pagination_token))
            .reply(200, generateTweets(10) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#leredita", pag_token: pagination_token }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.likes ).not.toBeNaN();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.comments ).not.toBeNaN();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.retweets ).not.toBeNaN();
            expect( tweet.media ).toBeDefined();
            expect(Array.isArray(tweet.media)).toBe(true);
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato hashtag, pagination token e quantità - tweet a sufficienza", async function () {
        const query = "#reazioneacatena";
        nock("https://api.twitter.com") 
            .get('/2/tweets/counts/all').query({query: `${query} -is:reply -is:retweet`})
            .reply(200, {
                "data": [
                    { "end": "2022-10-25T01:00:00.000Z", "start": "2022-10-25T00:00:00.000Z", "tweet_count": 10 },
                    { "end": "2022-10-25T03:00:00.000Z", "start": "2022-10-25T02:00:00.000Z", "tweet_count": 10 },
                    { "end": "2022-10-25T01:05:00.000Z", "start": "2022-10-25T00:04:00.000Z", "tweet_count": 30 }
                ],
                "meta": { "total_tweet_count": 50 }
            });
        const max_results = await getCountRecentKeywordTweets(query);

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, pagination_token, 50))
            .reply(200, generateTweets(50) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: query, pag_token: pagination_token, quantity: 50 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(max_results);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.likes ).not.toBeNaN();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.comments ).not.toBeNaN();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.retweets ).not.toBeNaN();
            expect( tweet.media ).toBeDefined();
            expect(Array.isArray(tweet.media)).toBe(true);
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato hashtag, pagination token e quantità - tweet non a sufficienza", async function () {
        const query = "#reazioneacatena";
        nock("https://api.twitter.com") 
            .get('/2/tweets/counts/all').query({query: `${query} -is:reply -is:retweet`})
            .reply(200, {
                "data": [
                    { "end": "2022-10-25T01:00:00.000Z", "start": "2022-10-25T00:00:00.000Z", "tweet_count": 10 },
                    { "end": "2022-10-25T03:00:00.000Z", "start": "2022-10-25T02:00:00.000Z", "tweet_count": 0 },
                    { "end": "2022-10-25T01:05:00.000Z", "start": "2022-10-25T00:04:00.000Z", "tweet_count": 30 }
                ],
                "meta": { "total_tweet_count": 40 }
            });
        const max_results = await getCountRecentKeywordTweets(query);

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, pagination_token, 50))
            .reply(200, generateTweets(40) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: query, pag_token: pagination_token, quantity: 50 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(max_results);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.likes ).not.toBeNaN();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.comments ).not.toBeNaN();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.retweets ).not.toBeNaN();
            expect( tweet.media ).toBeDefined();
            expect(Array.isArray(tweet.media)).toBe(true);
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato hashtag con spazi", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#leredita", pagination_token, 50))
            .reply(200, generateTweets(10) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: " #l eredita " }).expect(200);

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#leredita", pagination_token, 50))
            .reply(200, generateTweets(10) );
        const res2 = await curr_session.get("/tweets/keyword").query({ keyword: "#leredita" });
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets ).toEqual( res2.body.tweets );
        expect( res.body.next_token ).toBeDefined();
        expect( res.body.next_token ).toEqual( res2.body.next_token );
    });

    test("Tweet in intervallo temporale con date valide", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date1.toISOString(), date2.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), date2.toISOString()) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#reazioneacatena", pag_token: '', quantity: 20, start_time: date1, end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data d'inizio", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date1.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), new Date()) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#reazioneacatena", pag_token: '', quantity: 20, start_time: date1 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data di fine", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, "", date2.toISOString()))
            .reply(200, generateTweets(20, false, "1970-01-01T00:00:01Z", date2.toISOString()) );
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#reazioneacatena", pag_token: '', quantity: 20, start_time: '', end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Tweet con hashtag senza tweet", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#uniboswe39393948aaa999", pagination_token))
            .reply(200);
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#uniboswe39393948aaa999" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });
});


describe("Richieste errate a /tweets/keyword", function () {
    test("Tweet senza hashtag e senza pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("", ""))
            .reply(400);
        const res = await curr_session.get("/tweets/keyword").query({ }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet senza hashtag", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("", pagination_token))
            .reply(400);
        const res = await curr_session.get("/tweets/keyword").query({ pag_token: pagination_token }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet con token errato", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "123456789"))
            .reply(400);
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#reazioneacatena", pag_token: "123456789" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet in intervallo temporale con date coincidenti", async function () {
        nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date1.toISOString(), date1.toISOString()))
                .reply(400);
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#reazioneacatena", pag_token: '', quantity: 20, start_time: date1, end_time: date1 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet in intervallo temporale con data di fine prima di data d'inizio", async function () {
        nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date2.toISOString(), date1.toISOString()))
                .reply(400);
        const res = await curr_session.get("/tweets/keyword").query({ keyword: "#reazioneacatena", pag_token: '', quantity: '', start_time: date2, end_time: date1 }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });
});