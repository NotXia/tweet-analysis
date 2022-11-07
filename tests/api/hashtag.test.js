require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");

let curr_session = session(app);

let pagination_token;

describe("Richieste corrette a /tweets/hashtag", function () {
    test("Tweet dato solo hashtag", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita" }).expect(200);
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
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita", pag_token: pagination_token }).expect(200);
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
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita", pag_token: pagination_token, quantity: 50 }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets.length ).toBeGreaterThanOrEqual(50);
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

    test("Tweet dato hashtag con # all'inizio", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "#leredita" }).expect(200);
        const res2 = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita" });
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets ).toEqual( res2.body.tweets );
        expect( res.body.next_token ).toBeDefined();
        expect( res.body.next_token ).toEqual( res2.body.next_token );
    });

    test("Tweet dato hashtag con spazi", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: " l eredita " }).expect(200);
        const res2 = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita" });
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets ).toEqual( res2.body.tweets );
        expect( res.body.next_token ).toBeDefined();
        expect( res.body.next_token ).toEqual( res2.body.next_token );
    });

    test("Tweet dato hashtag con # e spazi", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: " # l eredita " }).expect(200);
        const res2 = await curr_session.get("/tweets/hashtag").query({ hashtag: "leredita" });
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.tweets ).toEqual( res2.body.tweets );
        expect( res.body.next_token ).toBeDefined();
        expect( res.body.next_token ).toEqual( res2.body.next_token );
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
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "uniboswe39393948aaa999zed" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });

    test("Tweet con token errato", async function () {
        const res = await curr_session.get("/tweets/hashtag").query({ hashtag: "reazioneacatena", pag_token: "123456789" }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
        expect( res.body.next_token ).toEqual("");
    });
});