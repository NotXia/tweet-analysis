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

describe("Test ricerca tweet data parola chiave", function () {
    test("Ricerca tweet per parola chiave senza pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita"))
            .reply(200, generateTweets(10) );
        const tweets = await getTweetsByKeyword("l'eredita");
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

    test("Ricerca tweet per parola chiave con pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita"))
            .reply(200, generateTweets(10) );
        const tweetsPage1 = await getTweetsByKeyword("l'eredita");
        expect( tweetsPage1.next_token ).toBeDefined();
        
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita", tweetsPage1.next_token))
            .reply(200, generateTweets(10) );
        const tweetsPage2 = await getTweetsByKeyword("l'eredita", tweetsPage1.next_token);
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

    test("Ricerca tweet per parola chiave in intervallo temporale con date valide", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita", "", 20, date1.toISOString(), date2.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), date2.toISOString()) );
        const tweets = await getTweetsByKeyword("l'eredita", '', 20, date1, date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con solo data d'inizio", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita", "", 20, date1.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), new Date()) );
        const tweets = await getTweetsByKeyword("l'eredita", '', 20, date1);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con solo data di fine", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita", "", 20, "", date2.toISOString()))
            .reply(200, generateTweets(20, false, "1970-01-01T00:00:01Z", date2.toISOString()) );
        const tweets = await getTweetsByKeyword("l'eredita", '', 20, '', date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });


    test("Ricerca tweet per parola chiave in intervallo temporale con date nello stesso giorno", async function () {
        try {
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("l'eredita", "", 20, date1.toISOString(), date1.toISOString()))
                .reply(200, generateTweets(20, false, date1.toISOString(), date1.toISOString()) );
            await getTweetsByKeyword("l'eredita", '', 20, date1, date1);
        }
        catch (err) {
            expect(err).toBeDefined();
            return;
        }
        throw new Error("Eccezione non lanciata - Estremi intervallo coincidenti");
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con data di fine prima di data d'inizio", async function () {
        try {
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("l'eredita", "", 20, date2.toISOString(), date1.toISOString()))
                .reply(400);
            await getTweetsByKeyword("l'eredita", '', 20, date2, date1);
        } catch (error) {
            expect( error ).toBeDefined();
            return;
        }
        throw new Error('Eccezione non lanciata');
    });

    test("Ricerca tweet per parola chiave con pagination token sbagliato", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("l'eredita", "dsifj"))
            .reply(500);
        try {
            await getTweetsByKeyword("l'eredita", "dsifj");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet con parola chiave vuota", async function () {
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

describe("Test ricerca tweet data frase chiave", function () {
    test("Ricerca tweet per frase chiave senza pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("reazione a catena"))
            .reply(200, generateTweets(10) );
        const tweets = await getTweetsByKeyword("reazione a catena");
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

    test("Ricerca tweet per frase chiave con pagination token", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("reazione a catena"))
            .reply(200, generateTweets(10) );
        const tweetsPage1 = await getTweetsByKeyword("reazione a catena");
        expect( tweetsPage1.next_token ).toBeDefined();

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("reazione a catena", tweetsPage1.next_token))
            .reply(200, generateTweets(10) );
        const tweetsPage2 = await getTweetsByKeyword("reazione a catena", tweetsPage1.next_token);
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

    test("Ricerca tweet per frase chiave con pagination token sbagliato", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("reazione a catena", "dsifj"))
            .reply(500);
        try {
            await getTweetsByKeyword("reazione a catena", "dsifj");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet con frase chiave vuota", async function () {
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