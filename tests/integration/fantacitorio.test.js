require("dotenv").config();
const moment = require('moment');
import mongoose from "mongoose"

moment().format();

const { getPointsByWeek, getSquads } = require("../../modules/games/fantacitorio");

jest.setTimeout(120000);
afterEach(async () => { await new Promise(r => setTimeout(r, 1000)); });

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("Test funzione getPointsByWeek", function() {
    test("Ricerca punteggi con malus", async function () {
        const date = moment("2022-11-26T00:00:01Z").utc();

        const result = await(getPointsByWeek(date));
        expect( result ).toBeDefined();
        expect( result['BERLUSCONI SILVIO'] ).toEqual(100);
        expect( result['ZINZI GIANPIERO'] ).toEqual(-30);
        expect( result['SOUMAHORO ABOUBAKAR'] ).toEqual(3000);
    });
})

describe("Test funzione getSquads", function() {
    test("Ricerca squadre senza pagination token", async function () {
        const result = await(getSquads());
        expect( result.tweets ).toBeDefined();
        expect( result.next_token ).toBeDefined();
        for (const tweet of result.tweets) {
            expect( tweet.tweet ).toBeDefined();
            expect( tweet.squad ).toBeDefined();
        }
    });
})