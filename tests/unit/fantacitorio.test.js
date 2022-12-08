require("dotenv").config();
const moment = require('moment');
const { generateParams, generateTweets, generateCustomTweet, nockTwitterUsersByUsername } = require("../utils/tweet.js");
import mongoose from "mongoose"
import nock from "nock";

moment().format();

const { getPointsByWeek, testing } = require("../../modules/games/fantacitorio");

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("Test funzione parsePoints", function() {
    test("Ricerca punti dato un testo regolare", async function () {
        const result = await(testing.parsePoints(`
        400 PUNTI - BARBARA FLORIDIA 

        800 PUNTI A:
        LUIGI NAVE
        ADA LOPREIATO 
        CONCETTA DAMANTE
        GABRIELLA DI GIROLAMO
        SABRINA LICHERI
        ALESSANDRA MAIORINO
        `));
        expect( result['FLORIDIA BARBARA'] ).toEqual(400);
        expect( result['NAVE LUIGI'] ).toEqual(800);
        expect( result['MAIORINO ALESSANDRA'] ).toEqual(800);
    });

    test("Ricerca punti dato un testo con malus", async function () {
        const result = await(testing.parsePoints(`
        MALUS DI 30 PUNTI PER GIANPIERO ZINZI
        `));
        expect( result['ZINZI GIANPIERO'] ).toEqual(-30);
    });

    test("Ricerca punti dato un testo con testo contenente 'o' al posto di 0", async function () {
        const result = await(testing.parsePoints(`
        1OO PUNTI PER SILVIO BERLUSCONI 
        "Alla carriera"
        `));
        expect( result['BERLUSCONI SILVIO'] ).toEqual(100);
    });
})

describe("Test funzione getPointsByWeek", function() {
    test("Ricerca punteggi con una data regolare", async function () {
        const username = "Fanta_citorio";
        const date = moment("2022-11-30T00:00:01Z").utc();

        const tweetText = `
        400 PUNTI - BARBARA FLORIDIA 
        
        800 PUNTI A:
        LUIGI NAVE
        ADA LOPREIATO 
        CONCETTA DAMANTE
        GABRIELLA DI GIROLAMO
        SABRINA LICHERI
        ALESSANDRA MAIORINO
        `
        let batch = generateTweets(2, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), tweetText, username);
                
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
        .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("week").toISOString(), date.endOf("week").toISOString()))
        .reply(200, batch);

        const result = await(getPointsByWeek(date));
        expect( result['FLORIDIA BARBARA'] ).toEqual(800);
        expect( result['NAVE LUIGI'] ).toEqual(1600);
        expect( result['MAIORINO ALESSANDRA'] ).toEqual(1600);
    });

    test("Ricerca punteggi con una data nel futuro", async function () {
        const username = "Fanta_citorio";
        const date = moment().add(2, "days").utc();

        const tweetText = `
        400 PUNTI - BARBARA FLORIDIA 
        
        800 PUNTI A:
        LUIGI NAVE
        ADA LOPREIATO 
        CONCETTA DAMANTE
        GABRIELLA DI GIROLAMO
        SABRINA LICHERI
        ALESSANDRA MAIORINO
        `
        let batch = generateTweets(2, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), tweetText, username);
                
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
        .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("week").toISOString(), date.endOf("week").toISOString()))
        .reply(200, batch);

        const result = await(getPointsByWeek(date));
        expect( result['FLORIDIA BARBARA'] ).toEqual(800);
        expect( result['NAVE LUIGI'] ).toEqual(1600);
        expect( result['MAIORINO ALESSANDRA'] ).toEqual(1600);
    });
})
