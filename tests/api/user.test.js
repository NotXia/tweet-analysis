require("dotenv").config();

const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
const { generateParams, generateTweets, nockTwitterUsersByUsername } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

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

describe("Richieste corrette a /tweets/user", function () {
    test("Tweet dato solo username", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk"))
            .reply(200, generateTweets(10) );

        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("elonmusk");
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

    test("Tweet dato username e pagination token", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", pagination_token))
            .reply(200, generateTweets(10) );

        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: pagination_token }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("elonmusk");
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

    test("Tweet dato username, pagination token e quantità", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", pagination_token, 120))
            .reply(200, generateTweets(120) );

        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: pagination_token, quantity: 120 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(120);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("elonmusk");
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

    test("Tweet dato username con spazi", async function () {
        nockTwitterUsersByUsername("sweteam12");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:sweteam12"))
            .reply(200, generateTweets(10) );

        const res = await curr_session.get("/tweets/user").query({ user: "  sweteam12    " }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("sweteam12");
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

    test("Tweet dato username con @ all'inizio", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk"))
            .reply(200, generateTweets(10) );

        const res = await curr_session.get("/tweets/user").query({ user: "@elonmusk" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("elonmusk");
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

    test("Tweet dato username con @, spazi, e casing diverso", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk"))
            .reply(200, generateTweets(10) );

        const res = await curr_session.get("/tweets/user").query({ user: " @ elONmUsK    " }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("elonmusk");
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

    test("Tweet in intervallo temporale con date valide", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 20, date1.toISOString(), date2.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), date2.toISOString()) );
        
        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: '', quantity: 20, start_time: date1, end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data d'inizio", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 20, date1.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), new Date()) );

        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: '', quantity: 20, start_time: date1 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data di fine", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 20, "", date2.toISOString()))
            .reply(200, generateTweets(20, false, "1970-01-01T00:00:01Z", date2.toISOString()) );

        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: '', quantity: 20, start_time: '', end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });
});


describe("Richieste errate a /tweets/user", function () {
    test("Tweet senza username", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:"))
            .reply(400);

        const res = await curr_session.get("/tweets/user").query({ pag_token: pagination_token }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet con username errato", async function () {
        nockTwitterUsersByUsername("pispist998547712669855417411uniboswe");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:pispist998547712669855417411uniboswe"))
            .reply(200);

        const res = await curr_session.get("/tweets/user").query({ user: "pispist998547712669855417411uniboswe" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet con token errato", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "123456789"))
            .reply(200);

        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: "123456789" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet in intervallo temporale con date coincidenti", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 20, date1.toISOString(), date1.toISOString()))
            .reply(400);
    
        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: '', quantity: 20, start_time: date1, end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet in intervallo temporale con data di fine prima di data d'inizio", async function () {
        nockTwitterUsersByUsername("elonmusk");
        nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams("from:elonmusk", "", 20, date1.toISOString(), date1.toISOString()))
                .reply(400);
    
        const res = await curr_session.get("/tweets/user").query({ user: "elonmusk", pag_token: '', quantity: '', start_time: date2, end_time: date1 }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });
});