require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
const { generateParams, generateCustomTweet } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

let curr_session = session(app);

describe("Test ricerca parola vincente - Ghigliottina", function () {
    test("Ricerca parola vincente con tweet da una riga", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet("La #parola della #ghigliottina de #leredita di oggi è: DISTANZA") );

        const res = await curr_session.get("/games/ghigliottina/winning_word").query({ date: "2022-11-25T00:00:01Z" }).expect(200);
        expect( res.body.word ).toEqual("DISTANZA");
        expect( res.body.date ).toBeDefined();
    });

    test("Ricerca parola vincente con tweet da più righe", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
            Complimenti ai 57 giocatori che hanno indovinato!

            La #parola della #ghigliottina de #leredita di oggi è: INTERVALLO

            I 5 indizi di oggi sono:
            SENZA
            SPAZIO
            SUONARE
            NOTE
            PECORE

            Vediamo chi sono i campioni 👇👇👇`) );

        const res = await curr_session.get("/games/ghigliottina/winning_word").query({ date: "2022-11-25T00:00:01Z" }).expect(200);
        expect( res.body.word ).toEqual("INTERVALLO");
        expect( res.body.date ).toBeDefined();
    });

    test("Ricerca parola vincente con tweet da più righe con doppi spazi", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
            Complimenti ai 57  giocatori che  hanno indovinato!

            La  #parola  della  #ghigliottina  de  #leredita  di  oggi  è:  BALLO

            I  5  indizi di oggi sono:
            SENZA
            SPAZIO
            SUONARE
            NOTE
            PECORE

            Vediamo chi sono i campioni 👇👇👇`) );

        const res = await curr_session.get("/games/ghigliottina/winning_word").query({ date: "2022-11-25T00:00:01Z" }).expect(200);
        expect( res.body.word ).toEqual("BALLO");
        expect( res.body.date ).toBeDefined();
    });

    test("Ricerca parola vincente con data nel futuro", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;

        const future = moment().add(2, "days");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, future.utc().startOf("day").toISOString(), future.utc().endOf("day").toISOString()))
            .reply(400);

        await curr_session.get("/games/ghigliottina/winning_word").query({ date: future.utc().toISOString() }).expect(400);
    });
});

describe("Test ricerca parola vincente - Reazione a catena", function () {
    test("Ricerca parola vincente con tweet da una riga", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet("La #parola della #catena finale per #reazioneacatena di oggi è: BOTTIGLIA") );

        const res = await curr_session.get("/games/catenafinale/winning_word").query({ date: "2022-11-25T00:00:01Z" }).expect(200);
        expect( res.body.word ).toEqual("BOTTIGLIA");
        expect( res.body.date ).toBeDefined();
    });

    test("Ricerca parola vincente con tweet da più righe", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
                Bella sfida per #reazioneacatena con ben 49 Campioni!

                La #parola della #catena finale per #reazioneacatena di oggi è: CATENA
                
                Gli indizi di oggi sono:
                REAZIONE
                RI  ...  O
                CONTRARIO
                
                Vediamo chi sono i campioni 👇👇👇`) );

        const res = await curr_session.get("/games/catenafinale/winning_word").query({ date: "2022-11-25T00:00:01Z" }).expect(200);
        expect( res.body.word ).toEqual("CATENA");
        expect( res.body.date ).toBeDefined();
    });

    test("Ricerca parola vincente con tweet da più righe con doppi spazi", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
                Bella sfida per #reazioneacatena con ben 49 Campioni!

                La  #parola della  #catena  finale  per  #reazioneacatena di oggi è:  SERPENTE
                
                Gli indizi di oggi sono:
                REAZIONE
                RI  ...  O
                CONTRARIO
                
                Vediamo chi sono i campioni 👇👇👇`) );

        const res = await curr_session.get("/games/catenafinale/winning_word").query({ date: "2022-11-25T00:00:01Z" }).expect(200);
        expect( res.body.word ).toEqual("SERPENTE");
        expect( res.body.date ).toBeDefined();
    });

    test("Ricerca parola vincente con data nel futuro", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;

        const future = moment().add(2, "days");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, future.utc().startOf("day").toISOString(), future.utc().endOf("day").toISOString()))
            .reply(400);

        await curr_session.get("/games/catenafinale/winning_word").query({ date: future.utc().toISOString() }).expect(400);
    });
});