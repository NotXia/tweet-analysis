require("dotenv").config();
const moment = require('moment');
moment().format();

const { ghigliottina } = require("../../modules/games/ghigliottina.js")


jest.setTimeout(60000);


describe("Test ricerca tweet della ghigliottina idonei", function() {
    test("Tweet ghigliottina in data passata", async function() {
        let past_tweets = await ghigliottina("2022-11-15");
        expect( past_tweets ).toBeDefined();
    });

    test("Tweet ghigliottina di oggi", async function() {
        let past_tweets = await ghigliottina(moment().toISOString());
        expect( past_tweets ).toBeDefined();
    });

    test("Tweet ghigliottina per data futura", async function() {
        try {
            await ghigliottina(moment().add(2, 'days'));
        }
        catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error("Eccezione non lanciata");
    });
})