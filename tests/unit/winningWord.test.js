require("dotenv").config();
const moment = require('moment');
const { generateParams, generateCustomTweet } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { getWinningWord } = require("../../modules/games/winningWord.js");

describe("Test ricerca parola vincente - Ghigliottina", function () {
    test("Ricerca parola vincente con tweet da una riga", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet("La #parola della #ghigliottina de #leredita di oggi è: DISTANZA") );

        const word = await getWinningWord("2022-11-25T00:00:01Z");
        expect(word.word).toEqual("DISTANZA");
    });

    test("Ricerca parola vincente con tweet da più righe", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
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
        expect(word.word).toEqual("INTERVALLO");
    });

    test("Ricerca parola vincente con tweet da più righe e doppi spazi", async function () {
        const search="La #parola della #ghigliottina de #leredita di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
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
        expect(word.word).toEqual("BALLO");
    });
})

describe("Test ricerca parola vincente - Reazione a catena", function () {
    test("Ricerca parola vincente con tweet da una riga", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet("La #parola della #catena finale per #reazioneacatena di oggi è: PALLONE") );

        const word = await getWinningWord("2022-11-25T00:00:01Z", "La #parola della #catena finale per #reazioneacatena di oggi è:");
        expect(word.word).toEqual("PALLONE");
    });

    test("Ricerca parola vincente con tweet da più righe", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
                Bella sfida per #reazioneacatena con ben 49 Campioni!

                La #parola della #catena finale per #reazioneacatena di oggi è: RIFLESSO
                
                Gli indizi di oggi sono:
                REAZIONE
                RI  ...  O
                CONTRARIO
                
                Vediamo chi sono i campioni 👇👇👇`) );

        const word = await getWinningWord("2022-11-25T00:00:01Z", "La #parola della #catena finale per #reazioneacatena di oggi è:");
        expect(word.word).toEqual("RIFLESSO");
    });

    test("Ricerca parola vincente con tweet da più righe e doppi spazi", async function () {
        const search="La #parola della #catena finale per #reazioneacatena di oggi è:";
        const from="quizzettone";
        const query = `from:${from} "${search}"`;
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(query, "", 10, moment("2022-11-25T00:00:01Z").utc().startOf("day").toISOString(), moment("2022-11-25T00:00:01Z").utc().endOf("day").toISOString()))
            .reply(200, generateCustomTweet(`
                Bella sfida per #reazioneacatena con ben 49 Campioni!

                La  #parola della  #catena  finale per  #reazioneacatena di oggi è:  SCRIVANIA
                
                Gli indizi di oggi sono:
                REAZIONE
                RI  ...  O
                CONTRARIO
                
                Vediamo chi sono i campioni 👇👇👇`) );

        const word = await getWinningWord("2022-11-25T00:00:01Z", "La #parola della #catena finale per #reazioneacatena di oggi è:");
        expect(word.word).toEqual("SCRIVANIA");
    });
})