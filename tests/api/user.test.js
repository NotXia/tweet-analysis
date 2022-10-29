require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");

let curr_session = session(app);

let pagination_token;

describe("Richieste corrette a /tweets/user", function () {
    test("Tweet dato solo username", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe" }).expect(200);
        expect( res.body.tweets ).toBeDefined();
        expect( res.body.next_token ).toBeDefined();
        pagination_token = res.body.next_token;
    });

    test("Tweet dato username e pagination token", async function () {
        const res = await curr_session.get("/tweets/user").query({ user: "wwe", pag_token: pagination_token }).expect(200);
        expect( res.body.tweets ).toBeDefined();
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