require("dotenv").config();
const moment = require('moment');
moment().format();

const { getWinningWord } = require("../../modules/games/winningWord.js");

jest.setTimeout(60000);

describe("Test ricerca tweet con parola vincente", function () {
    test("Ricerca parola del passato", async function () {
        const date = "2022-11-29T15:48:53.225Z";
        let tweet = await getWinningWord(date);

        expect( tweet.word ).toBeDefined();
        expect( tweet.date ).toBeDefined();
    });

    test("Ricerca parola in una data futura", async function () {
        try {
            const date = moment().add(2, "days").utc().toISOString();
            await getWinningWord(date);
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error("Eccezione non lanciata");
    });
});
