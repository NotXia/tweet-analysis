require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");


let curr_session = session(app);

describe("Richieste corrette a /analysis/sentiment", function () {
    test("Tweet senza specificare la lingua", async function () {
        const res = await curr_session.get("/analysis/sentiment").query({ tweet: "Sono veramente euforico" }).expect(200);
        expect( res.body.sentiment ).toEqual("positive");
        expect( res.body.language ).toEqual("it");
    });

    test("Tweet con bias", async function () {
        let res = await curr_session.get("/analysis/sentiment").query({ tweet: `Ho sentito che ha detto "that's an astounding table"`, bias: "en" }).expect(200);
        expect( res.body.sentiment ).toEqual("positive");
        expect( res.body.language ).toEqual("en");
    });

    test("Tweet specificando la lingua", async function () {
        let res = await curr_session.get("/analysis/sentiment").query({ tweet: `Frase in spagnolo`, lang: "uk" }).expect(200);
        expect( res.body.sentiment ).toEqual("neutral");
        expect( res.body.language ).toEqual("uk");
    });
});

describe("Richieste errate a /analysis/sentiment", function () {
    test("Tweet mancante", async function () {
        const res = await curr_session.get("/analysis/sentiment").query({ lang: "fi" }).expect(400);
        expect( res.body.errors.tweet ).toBeDefined();
        expect( res.body.errors.lang ).not.toBeDefined();
        expect( res.body.errors.bias ).not.toBeDefined();
    });

    test("Formato lingua errata", async function () {
        let res = await curr_session.get("/analysis/sentiment").query({ tweet: "Che bella giornata", lang: "BLQ" }).expect(400);
        expect( res.body.errors.lang ).toBeDefined();
        expect( res.body.errors.bias ).not.toBeDefined();
        expect( res.body.errors.tweet ).not.toBeDefined();

        res = await curr_session.get("/analysis/sentiment").query({ tweet: "Che brutta giornata", bias: "Mi sono perso" }).expect(400);
        expect( res.body.errors.bias ).toBeDefined();
        expect( res.body.errors.lang ).not.toBeDefined();
        expect( res.body.errors.tweet ).not.toBeDefined();
    });
});