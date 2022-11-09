require("dotenv").config();

const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
moment().format();

let curr_session = session(app);

let pagination_token;
const limit = new Date('2010-11-06T00:00:01Z');
const today = new Date();
today.setHours(23,59,59,999);
let future = new Date();
future = new Date(moment(future).add(7, 'days'));

describe("Richieste corrette a /tweets/user", function () {
    test("Tweet dato solo username", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("wwe");
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
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: pagination_token }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("wwe");
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
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: pagination_token, quantity: 120 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toEqual(120);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("wwe");
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
        const res = await curr_session.get("/tweets/user").query({ user: "@wwe" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("wwe");
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
        const res = await curr_session.get("/tweets/user").query({ user: " @ wwE    " }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeLessThanOrEqual(10);
        for(const tweet of res.body.tweets) {
            expect( tweet ).toBeDefined();
            expect( tweet.id ).toBeDefined();
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.username.toLowerCase() ).toEqual("wwe");
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
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: '2022-11-01T15:20:12Z', end_time: '2022-11-05T11:12:31Z' }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
            expect( tweet.time <= '2022-11-05T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data d'inizio", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: '2022-11-01T15:20:12Z' }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con solo data di fine", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: '', end_time: '2022-11-05T11:12:31Z' }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            expect( tweet.time <= '2022-11-05T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con data di inizio prima del limite", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: '2009-11-06T00:00:01Z', end_time: '2022-11-05T11:12:31Z' }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time >= limit ).toBeTruthy();
            expect( tweet.time <= '2022-11-05T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con data di fine nel futuro", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: '', end_time: future }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            const time = new Date(tweet.time);
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con date nello stesso giorno", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: '2022-11-01T15:20:12Z', end_time: '2022-11-01T17:12:31Z' }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        for (const tweet of res.body.tweets) {
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
            expect( tweet.time <= '2022-11-01T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Tweet in intervallo temporale con data di inizio e data di fine a oggi", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: 20, start_time: today, end_time: today }).expect(200);
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


describe("Richieste errate a /tweets/user", function () {
    test("Tweet senza username", async function () {
        const res = await curr_session.get("/tweets/user").query({ pag_token: pagination_token }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet con username errato", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "pispist998547712669855417411uniboswe" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet con token errato", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: "123456789" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet in intervallo temporale con data di fine prima di data d'inizio", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: '', start_time: '2022-11-05T11:12:31Z', end_time: '2022-11-01T15:20:12Z' }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet in intervallo temporale con data di inizio nel futuro", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: '', start_time: future }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet in intervallo temporale con data di fine prima del limite", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: '', quantity: '', start_time: '', end_time: '2009-11-06T00:00:01Z' }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });
});