require("dotenv").config();
const moment = require('moment');
moment().format();

const { catenaFinale } = require("../../modules/games/userAttempts")


jest.setTimeout(60000);


describe("Test ricerca tweet reazioneacatena idonei", function() {
    test("Tweet catena finale in data passata", async function() {
        let past_tweets = await catenaFinale("2022-09-22");
        expect( past_tweets ).toBeDefined();
    });

    test("Tweet catena finale per data futura", async function() {
        try {
            await catenaFinale(moment().add(2, 'days'));
        }
        catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error("Eccezione non lanciata");
    });
})