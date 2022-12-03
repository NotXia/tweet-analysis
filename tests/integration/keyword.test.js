require("dotenv").config();
const moment = require('moment');
const { checkTweetFormat } = require("../utils/tweet.js");
moment().format();

const { getTweetsByKeyword } = require("../../modules/fetch/keyword.js");


jest.setTimeout(120000);
afterEach(async () => { await new Promise(r => setTimeout(r, 1000)); });


let today = new Date();
today.setHours(23,59,59,999);
let future = new Date();
future = new Date(moment(future).add(7, 'days'));
let date1 = new Date();
date1 = new Date(moment(date1).subtract(5, 'days'));
date1.setHours(0,0,0,0);
let date2 = new Date();
date2 = new Date(moment(date2).subtract(1, 'days'));
date2.setHours(23,59,59,999);

let page1_tweets;

describe("Test ricerca tweet data parola chiave", function () {
    test("Ricerca tweet per parola chiave (prima pagina, senza pagination token)", async function () {
        page1_tweets = await getTweetsByKeyword("l'eredita");
        for (const tweet of page1_tweets.tweets) {
            checkTweetFormat(tweet);
        }
    });
    
    test("Ricerca tweet con parola chiave vuota", async function () {
        try {
            await getTweetsByKeyword("");
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error("Eccezione non lanciata");
    });
});


describe("Test pagination token", function () {
    test("Ricerca tweet per parola chiave con pagination token", async function () {
        expect( page1_tweets.next_token ).toBeDefined();

        const tweetsPage2 = await getTweetsByKeyword("l'eredita", page1_tweets.next_token);
        for (const tweet of tweetsPage2.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca tweet per parola chiave con pagination token sbagliato", async function () {
        try {
            await getTweetsByKeyword("l'eredita", "dsifj");
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error("Eccezione non lanciata");
    });
});

describe("Test ricerca per date", function () {
    test("Ricerca tweet per parola chiave in intervallo temporale con date valide", async function () {
        const tweets = await getTweetsByKeyword("l'eredita", '', 10, date1, date2);
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);

            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con solo data d'inizio", async function () {
        const tweets = await getTweetsByKeyword("l'eredita", '', 10, date1);
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con solo data di fine", async function () {
        const tweets = await getTweetsByKeyword("l'eredita", '', 10, '', date2);
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con data di fine nel futuro", async function () {
        const tweets = await getTweetsByKeyword("l'eredita", '', 10, '', future);
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            
            const time = new Date(tweet.time);
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con data di inizio e data di fine a oggi", async function () {
        let today_start = new Date();
        today_start.setHours(0,0,0,0);
        let today_end = new Date();
        today_end.setHours(23,59,59,999);

        const tweets = await getTweetsByKeyword("f1", '', 10, today_start, today_end);

        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            
            const time = new Date(tweet.time);
            expect( time >= today_start ).toBeTruthy();
            expect( time <= today ).toBeTruthy();
        }
    });
    
    test("Ricerca tweet per parola chiave in intervallo temporale con date nello stesso giorno", async function () {
        try {
            await getTweetsByKeyword("l'eredita", '', 10, date1, date1);
        }
        catch (err) {
            return expect(err).toBeDefined();
        }
        throw new Erorr("Eccezione non lanciata - Estremi intervallo coincidenti")
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con data di fine prima di data d'inizio", async function () {
        try {
            await getTweetsByKeyword("l'eredita", '', 10, date2, date1);
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });

    test("Ricerca tweet per parola chiave in intervallo temporale con data di inizio nel futuro", async function () {
        try {
            await getTweetsByKeyword("l'eredita", '', 10, future);
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });
});



describe("Test ricerca tweet data frase chiave", function () {
    test("Ricerca tweet per frase chiave (prima pagina, senza pagination token)", async function () {
        page1_tweets = await getTweetsByKeyword("reazione a catena");
        for (const tweet of page1_tweets.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca tweet per frase chiave con pagination token", async function () {
        expect( page1_tweets.next_token ).toBeDefined();

        const tweetsPage2 = await getTweetsByKeyword("reazione a catena", page1_tweets.next_token);
        for (const tweet of tweetsPage2.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca tweet per frase chiave in intervallo temporale con date valide", async function () {
        const tweets = await getTweetsByKeyword("reazione a catena", '', 10, date1, date2);
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });
});