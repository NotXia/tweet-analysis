require("dotenv").config();
const moment = require('moment');
const { generateParams, generateTweets } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { getTweetsByKeyword, testing } = require("../../modules/fetch/keyword.js");

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

describe("Test normalizzazione stringa di hashtag", function () {
    test("Normalizzazione testo con spazi", function () {
        expect( testing.normalizeKeyword("    stringa con spazi    ") ).toEqual("stringa con spazi");
    });
});

describe("Test ricerca tweet dato hashtag", function () {
    test("Ricerca tweet per hashtag senza pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena"))
            .reply(200, generateTweets(10) );
        const tweets = await getTweetsByKeyword("#reazioneacatena");
        for (const tweet of tweets.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
    });

    test("Ricerca tweet per hashtag con pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena"))
            .reply(200, generateTweets(10) );
        const tweetsPage1 = await getTweetsByKeyword("#reazioneacatena");
        expect( tweetsPage1.next_token ).toBeDefined();

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", tweetsPage1.next_token))
            .reply(200, generateTweets(10) );
        const tweetsPage2 = await getTweetsByKeyword("#reazioneacatena", tweetsPage1.next_token);
        for (const tweet of tweetsPage2.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con date valide", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date1.toISOString(), date2.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), date2.toISOString()) );
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, date1, date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con solo data d'inizio", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date1.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), new Date()) );
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, date1);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con solo data di fine", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, "", date2.toISOString()))
            .reply(200, generateTweets(20, false, "1970-01-01T00:00:01Z", date2.toISOString()) );
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, '', date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con date coincidenti", async function () {
        try {
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date1.toISOString(), date1.toISOString()))
                .reply(400);
            await getTweetsByKeyword("#reazioneacatena", '', 20, date1, date1);
            fail("Eccezione non lanciata - Estremi intervallo coincidenti")
        }
        catch (err) {
            expect(err).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di fine prima di data d'inizio", async function () {
        try {
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "", 20, date2.toISOString(), date1.toISOString()))
                .reply(400);
            await getTweetsByKeyword("#reazioneacatena", '', 20, date2, date1);
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag con pagination token sbagliato", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#reazioneacatena", "dsifj"))
            .reply(500);
        try {
            await getTweetsByKeyword("#reazioneacatena", "dsifj");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet con hashtag vuoto", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(""))
            .reply(500);
        try {
            await getTweetsByKeyword("");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
});