require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
moment().format();

const { getCountRecentHashtagTweets } = require("../../modules/fetch/countRecent.js");

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

describe("Richieste corrette a /tweets/hashtag", function () {
    test("Tweet dato solo hashtag", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#leredita" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
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
        }
        expect( res.body.next_token ).toBeDefined();
        pagination_token = res.body.next_token;
    });

    test("Tweet dato hashtag e pagination token", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#leredita", pag_token: pagination_token }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
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
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato hashtag, pagination token e quantità", async function () {
        const query = "#reazioneacatena";
        const max_results = await getCountRecentHashtagTweets(query);
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: query, pag_token: pagination_token, quantity: 50 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(max_results);
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
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato hashtag con spazi", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: " l eredita " }).expect(200);
        const res2 = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita" });
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets ).toEqual( res2.body.tweets );
        expect( res.body.next_token ).toBeDefined();
        expect( res.body.next_token ).toEqual( res2.body.next_token );
    });

    test("Tweet in intervallo temporale con date valide", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: 20, start_time: date1, end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data d'inizio", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: 20, start_time: date1 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data di fine", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: 20, start_time: '', end_time: date2 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con data di inizio prima del limite", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: 20, start_time: '2022-10-06T00:00:01Z' }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= limit ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con data di fine nel futuro", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: 20, start_time: '', end_time: future }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con date nello stesso giorno", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: 20, start_time: date1, end_time: date1 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        let date1_end = new Date();
        date1_end = new Date(moment(date1_end).subtract(5, 'days'));
        date1_end.setHours(23,59,59,999);
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date1_end ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con data di inizio e data di fine a oggi", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#wwe", pag_token: '', quantity: 20, start_time: today, end_time: today }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        const today_start = new Date();
        today_start.setHours(0,0,0,0);
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= today_start ).toBeTruthy();
            expect( time <= today ).toBeTruthy();
        }
    });
});


describe("Richieste errate a /tweets/hashtag", function () {
    test("Tweet senza hashtag e senza pagination token", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet senza hashtag", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ pag_token: pagination_token }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet con hashtag senza tweet", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#uniboswe39393948aaa999zed" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet con token errato", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: "123456789" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet in intervallo temporale con data di fine prima di data d'inizio", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: '', start_time: date2, end_time: date1 }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet in intervallo temporale con data di inizio nel futuro", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: '', start_time: future }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet in intervallo temporale con data di fine prima del limite", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#reazioneacatena", pag_token: '', quantity: '', start_time: '', end_time: '2022-10-06T00:00:01Z' }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });
});