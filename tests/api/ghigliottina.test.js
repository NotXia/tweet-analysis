require("dotenv").config();
const app = require("../../index.js");
const session = require("supertest-session");
const moment = require('moment');
const { generateParams, generateTweets } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

let curr_session = session(app);

describe("Richieste corrette a /games/ghigliottina ", function () {
    test("Data nel passato", async function () {
        const query = "#leredita";
        const date = moment("2022-10-25T15:00:00.000Z").utc();

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, generateTweets(100, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#leredita cammelletto"));
        const res = await curr_session.get("/games/ghigliottina").query({ date: date.startOf("day").toISOString() }).expect(200);
        expect( res.body.tweets.length ).toEqual(100);
    });

    test("Data nel passato con risultato contenente URL", async function () {
        const query = "#leredita";
        const date = moment("2022-10-25T15:00:00.000Z").utc();

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, generateTweets(100, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#leredita https://t.co/LS655lKPU3"));
        const res = await curr_session.get("/games/ghigliottina").query({ date: date.startOf("day").toISOString() }).expect(200);
        expect( res.body.tweets.length ).toEqual(0);
    });

    test("Data nel futuro", async function () {
        const query = "#leredita";
        const date = moment().utc().add(2, 'days');

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(400);
        const res = await curr_session.get("/games/ghigliottina").query({ date: date.startOf("day").toISOString() }).expect(400);
        expect( res.body.tweets ).not.toBeDefined();
    });
});