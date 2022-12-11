require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
const { generateParams, generateTweets, nockTwitterUsersByUsername } = require("../utils/tweet.js");
import nock from "nock";
import mongoose from "mongoose"

moment().format();

let curr_session = session(app);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("Richieste corrette a /games/fantacitorio/recap ", function () {
    test("Data nel passato", async function () {
        const username = "Fanta_citorio";
        const date = moment("2022-12-01T15:00:00.000Z").utc();

        const tweetText = `
        400 PUNTI - BARBARA FLORIDIA 
        
        800 PUNTI A:
        LUIGI NAVE
        ADA LOPREIATO 
        CONCETTA DAMANTE
        GABRIELLA DI GIROLAMO
        SABRINA LICHERI
        ALESSANDRA MAIORINO

        1OO PUNTI PER SILVIO BERLUSCONI
        `

        let batch = generateTweets(2, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), tweetText, username);
        
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
            .reply(200, batch);

        const res = await curr_session.get("/games/fantacitorio/recap").query({ date: date.startOf("day").toISOString() }).expect(200);
        expect( res.body ).toBeDefined();
    });

    test("Data nel passato - Malus", async function () {
        const username = "Fanta_citorio";
        const date = moment("2022-12-01T15:00:00.000Z").utc();

        const tweetText = `MALUS DI 30 PUNTI PER ALESSANDRA MAIORINO`

        let batch = generateTweets(2, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), tweetText, username);
        
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
            .reply(200, batch);

        const res = await curr_session.get("/games/fantacitorio/recap").query({ date: date.startOf("day").toISOString() }).expect(200);
        expect( res.body ).toBeDefined();
    });
});

describe("Richieste errate a /games/fantacitorio/recap ", function () {
    test("Data nel futuro", async function () {
        const username = "Fanta_citorio";
        const date = moment("2022-12-01T15:00:00.000Z").utc();
        
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
            .reply(400);

        const res = await curr_session.get("/games/fantacitorio/recap").query({ date: date.startOf("day").toISOString() }).expect(500);
        expect( res.body ).toBeDefined();
    });

    test("Ricerca senza alcun risultato", async function () {
        const username = "Fanta_citorio";
        const date = moment("9999-11-30T00:00:01Z").utc();
        
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
            .reply(200, null);

        const res = await curr_session.get("/games/fantacitorio/recap").query({ date: date.startOf("day").toISOString() }).expect(400);
        expect( res.body ).not.toBeDefined();
    });
});