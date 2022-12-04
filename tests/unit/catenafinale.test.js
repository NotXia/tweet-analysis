require("dotenv").config();
const moment = require('moment');
const { generateParams, generateTweets } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { catenaFinale } = require("../../modules/games/catenaFinale.js");

describe("Test modulo catenaFinale", function() {
    test("Catena finale di una data del passato", async function () {
        const query = "#reazioneacatena";
        const date = moment("2022-10-25T15:00:00.000Z").utc();
        let batch = generateTweets(4, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#reazioneacatena cammelletto");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, batch);
        
        const result = await(catenaFinale("2022-10-25T15:00:00.000Z"));
        expect( result.length ).toEqual(4);
    });
    
    test("Catena finale di oggi", async function () {
        const query = "#reazioneacatena";
        const now = moment().utc();
        let batch = generateTweets(100, true, moment().utc().startOf("day").toISOString(), "", "#reazioneacatena giacomino");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, moment().utc().startOf("day").toISOString()))
            .reply(200, batch);

        const result = await(catenaFinale(now.startOf("minute").toISOString()));
        expect( result.length ).toEqual(100);
    });
    
    test("Catena finale di una data del passato dove i tweet contengono URL", async function () {
        const query = "#reazioneacatena";
        const date = moment("2022-10-25T15:00:00.000Z").utc();
        let batch = generateTweets(4, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#reazioneacatena https://t.co/LS655lKPU3");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, batch);
        
        const result = await(catenaFinale("2022-10-25T15:00:00.000Z"));
        expect( result.length ).toEqual(0);
    });
    
    test("Catena finale di una data del futuro", async function () {
        const query = "#reazioneacatena";
        const date = moment().utc().add(2, 'days');
        let batch = generateTweets(4, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#reazioneacatena cammelletto");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, batch);
        
        try {
            await(catenaFinale(date));
            fail("Eccezione non lanciata");
        } catch (err) {
            expect( err ).toBeDefined();
        }
    });
})