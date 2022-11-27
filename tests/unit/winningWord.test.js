require("dotenv").config();
const moment = require('moment');
const { generateParams, generateWinningWordTweet } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { getWinningWord } = require("../../modules/games/winningWord.js");

describe("Test ricerca parola vincente", function () {
    test("Ricerca parola vincente con tweet da una riga", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateWinningWordTweet("La #parola della #ghigliottina de #leredita di oggi è: DISTANZA") );

        const word = await getWinningWord("2022-11-25T00:00:01Z");
        expect(word).toEqual("DISTANZA");
    });

    test("Ricerca parola vincente con tweet da più righe", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateWinningWordTweet(`
                Complimenti ai 57 giocatori che hanno indovinato!

                La #parola della #ghigliottina de #leredita di oggi è: INTERVALLO

                I 5 indizi di oggi sono:
                SENZA
                SPAZIO
                SUONARE
                NOTE
                PECORE

                Vediamo chi sono i campioni 👇👇👇`) );

        const word = await getWinningWord("2022-11-25T00:00:01Z");
        expect(word).toEqual("INTERVALLO");
    });

    test("Ricerca parola vincente con tweet da più righe e doppi spazi", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateWinningWordTweet(`
                Complimenti ai 57  giocatori che  hanno indovinato!

                La  #parola  della  #ghigliottina  de  #leredita  di  oggi  è:  BALLO

                I  5  indizi di oggi sono:
                SENZA
                SPAZIO
                SUONARE
                NOTE
                PECORE

                Vediamo chi sono i campioni 👇👇👇`) );

        const word = await getWinningWord("2022-11-25T00:00:01Z");
        expect(word).toEqual("BALLO");
    });
})