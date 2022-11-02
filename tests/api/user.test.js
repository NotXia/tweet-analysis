require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");

let curr_session = session(app);

let pagination_token;

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
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato username con spazi", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "  wwe    " }).expect(200);
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
        }
        expect( res.body.next_token ).toBeDefined();
    });

    test("Tweet dato username con spazi", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "  wwe    " }).expect(200);
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
        }
        expect( res.body.next_token ).toBeDefined();
    });
});

describe("Richieste errate a /tweets/user", function () {
    test("Tweet senza username", async function () {
        const res = await curr_session.get("/tweets/user").query({ pag_token: pagination_token }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet con username errato", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "pispist998547712669855417411uniboswe" }).expect(500);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });

    test("Tweet con token errato", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: "123456789" }).expect(500);
        expect( res.body.tweets ).not.toBeDefined();
        expect( res.body.next_token ).not.toBeDefined();
    });
});