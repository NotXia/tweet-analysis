require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");


let curr_session = session(app);

describe("Richieste corrette a /analysis/stopwords", function () {
    test("Tweet senza specificare la lingua", async function () {
        const res = await curr_session.get("/analysis/stopwords").query({ tweet: "Ciao umano, mi sembri molto vivo" }).expect(200);
        expect( res.body.sentence ).toEqual("Ciao umano vivo");
    });

    test("Tweet con lingua", async function () {
        const res = await curr_session.get("/analysis/stopwords").query({ tweet: "Mi passi la penna on the table?", language: "it" }).expect(200);
        expect( res.body.sentence ).toEqual("passi penna on the table");
    });

    test("Tweet con bias", async function () {
        const res = await curr_session.get("/analysis/stopwords").query({ tweet: "Mi passi the pen on the table?", bias: "en" }).expect(200);
        expect( res.body.sentence ).toEqual("Mi passi pen table");
    });
});

describe("Richieste errate a /analysis/stopwords", function () {
    test("Richiesta senza tweet", async function () {
        await curr_session.get("/analysis/stopwords").query({ }).expect(400);
    });
});