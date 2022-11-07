require("dotenv").config();
const moment = require('moment');
moment().format();

const { getTweetsByKeyword, testing } = require("../../modules/fetch/keyword.js");

let today = new Date();
today.setHours(23,59,59,999);
let limit = new Date();
limit = new Date(moment(limit).subtract(7, 'days'));
let future = new Date();
future = new Date(moment(future).add(7, 'days'));
let date1 = new Date();
date1 = new Date(moment(date1).subtract(5, 'days'));
date1.setHours(0,0,0,0);
let date2 = new Date();
date2 = new Date(moment(date2).subtract(1, 'days'));
date2.setHours(23,59,59,999);

describe("Test normalizzazione stringa di hashtag", function () {
    test("Normalizzazione testo con spazi", function () {
        expect( testing.normalizeKeyword("    stringa con spazi    ") ).toEqual("stringa con spazi");
    });
});

describe("Test ricerca tweet dato hashtag", function () {
    test("Ricerca tweet per hashtag senza pagination token - hashtag senza tweet", async function () {
        try {
            await getTweetsByKeyword("#asdijaosjasdac31284fh92381dsa");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag senza pagination token", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena");
        for (const tweet of tweets.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag con pagination token", async function () {
        const tweetsPage1 = await getTweetsByKeyword("#reazioneacatena");
        expect( tweetsPage1.next_token ).toBeDefined();
        const tweetsPage2 = await getTweetsByKeyword("#reazioneacatena", tweetsPage1.next_token);
        for (const tweet of tweetsPage2.tweets) {
            expect( tweet.name ).toBeDefined();
            expect( tweet.username ).toBeDefined();
            expect( tweet.pfp ).toBeDefined();
            expect( tweet.text ).toBeDefined();
            expect( tweet.time ).toBeDefined();
            expect( tweet.likes ).toBeDefined();
            expect( tweet.comments ).toBeDefined();
            expect( tweet.retweets ).toBeDefined();
            expect( tweet.media ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con date valide", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, date1, date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con solo data d'inizio", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, date1);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con solo data di fine", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, '', date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di inizio prima del limite", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, '2022-10-06T00:00:01Z');
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= limit ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di fine nel futuro", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, '', future);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con date nello stesso giorno", async function () {
        const tweets = await getTweetsByKeyword("#reazioneacatena", '', 20, date1, date1);
        let date1_end = new Date();
        date1_end = new Date(moment(date1_end).subtract(5, 'days'));
        date1_end.setHours(23,59,59,999);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date1_end ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di inizio e data di fine a oggi", async function () {
        const tweets = await getTweetsByKeyword("#wwe", '', 20, today, today);
        const today_start = new Date();
        today_start.setHours(0,0,0,0);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= today_start ).toBeTruthy();
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di fine prima di data d'inizio", async function () {
        try {
            await getTweetsByKeyword("#reazioneacatena", '', 20, date2, date1);
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di inizio nel futuro", async function () {
        try {
            await getTweetsByKeyword("#reazioneacatena", '', 20, future);
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag in intervallo temporale con data di fine prima del limite", async function () {
        try {
            await getTweetsByKeyword("#reazioneacatena", '', 20, '', '2022-10-06T00:00:01Z');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag con pagination token sbagliato", async function () {
        try {
            await getTweetsByKeyword("#reazioneacatena", "dsifj");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet con hashtag vuoto", async function () {
        try {
            await getTweetsByKeyword("");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
});