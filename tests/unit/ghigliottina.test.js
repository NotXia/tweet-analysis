require("dotenv").config();
const moment = require('moment');
const { generateParams, generateTweets } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { ghigliottina } = require("../../modules/games/userAttempts.js");

describe("Test modulo ghigliottina", function() {
    test("Ghigliottina di una data del passato", async function () {
        const query = "#leredita";
        const date = moment("2022-10-25T15:00:00.000Z").utc();
        let batch = generateTweets(4, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#leredita cammelletto");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, batch);
        
        const result = await(ghigliottina("2022-10-25T15:00:00.000Z"));
        expect( result.length ).toEqual(4);
    });
    
    test("Ghigliottina di oggi", async function () {
        const query = "#leredita";
        const now = moment().utc();
        let batch = generateTweets(100, true, moment().utc().startOf("day").toISOString(), "", "#leredita giacomino");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, moment().utc().startOf("day").toISOString()))
            .reply(200, batch);

        const result = await(ghigliottina(now.startOf("minute").toISOString()));
        expect( result.length ).toEqual(100);
    });
    
    test("Ghigliottina di una data del passato dove i tweet contengono URL", async function () {
        const query = "#leredita";
        const date = moment("2022-10-25T15:00:00.000Z").utc();
        let batch = generateTweets(4, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#leredita https://t.co/LS655lKPU3");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, batch);
        
        const result = await(ghigliottina("2022-10-25T15:00:00.000Z"));
        expect( result.length ).toEqual(0);
    });
    
    test("Ghigliottina di una data del futuro", async function () {
        const query = "#leredita";
        const date = moment().utc().add(2, 'days');
        let batch = generateTweets(4, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), "#leredita cammelletto");

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 100, date.startOf("day").toISOString(), date.endOf("day").toISOString()))
            .reply(200, batch);
        
        try {
            await(ghigliottina(date));
            fail("Eccezione non lanciata");
        } catch (err) {
            expect( err ).toBeDefined();
        }
    });
})