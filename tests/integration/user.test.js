require("dotenv").config();
const moment = require('moment');
moment().format();
const { checkTweetFormat } = require("../utils/tweet.js");

const { getTweetsByUser, testing } = require("../../modules/fetch/user.js");


jest.setTimeout(120000);
afterEach(async () => { await new Promise(r => setTimeout(r, 1000)); });


let userTest;
const today = new Date();
today.setHours(23,59,59,999);
let future = new Date();
future = new Date(moment(future).add(7, 'days'));

let page1_tweets;


describe("Test ricerca nome utente", function () {
    test("Controllo esistenza utente", async function () {
        const user = await testing.usr_fetch("wwe");
        expect( user.name ).toBeDefined();
        expect( user.username ).toBeDefined();
        expect( user.profile_image_url ).toBeDefined();
        userTest = user;
    });

    test("Controllo conformit√† username", async function () {
        const user1 = await testing.usr_fetch("Luigi82724358");
        const user2 = await testing.usr_fetch("LUIGI82724358");
        const user3 = await testing.usr_fetch("  Luigi82724358    ");
        const user4 = await testing.usr_fetch(" @ Luigi82724358    ");
        expect( user1 ).toBeDefined();
        expect( user2 ).toBeDefined();
        expect( user3 ).toBeDefined();
        expect( user4 ).toBeDefined();
        expect( user1 ).toEqual( user2 );
        expect( user1 ).toEqual( user3 );
        expect( user1 ).toEqual( user4 );
    });
});

describe("Test ricerca tweet dato username utente", function () {
    test("Ricerca tweet per username utente (prima pagina, senza pagination token)", async function () {
        page1_tweets = await getTweetsByUser('sweteam12');
        for (const tweet of page1_tweets.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca tweet per username utente con pagination token", async function () {
        expect( page1_tweets.next_token ).toBeDefined();
        
        const tweetsPage2 = await getTweetsByUser(userTest.username, page1_tweets.next_token);
        for (const tweet of tweetsPage2.tweets) {
            checkTweetFormat(tweet);
        }
    });

    test("Ricerca tweet per username utente vuoto", async function () {
        try {
            await getTweetsByUser('');
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });

    test("Ricerca tweet per username errato", async function () {
        try {
            await getTweetsByUser('sdfsdgfaaaaasd');
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });

    test("Ricerca tweet per pagination token errato", async function () {
        try {
            await getTweetsByUser(userTest.username, 'dasfdasfsd');
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });

    test("Ricerca tweet per username errato e pagination token errato", async function () {
        try {
            await getTweetsByUser('adfdasdsgsg', 'dasfdasfsd');
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });
});

describe("Test ricerca per date", function () {
    test("Ricerca tweet per username in intervallo temporale con date valide", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 10, '2022-11-01T15:20:12Z', '2022-11-05T11:12:31Z');
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
            expect( tweet.time <= '2022-11-05T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con solo data d'inizio", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 10, '2022-11-01T15:20:12Z');
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con solo data di fine", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 10, '', '2022-11-05T11:12:31Z');
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            expect( tweet.time <= '2022-11-05T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di fine nel futuro", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 10, '', future);
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            const time = new Date(tweet.time);
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con date nello stesso giorno", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 10, '2022-11-01T15:20:12Z', '2022-11-01T17:12:31Z');
        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
            expect( tweet.time <= '2022-11-01T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di inizio e data di fine a oggi", async function () {
        let today_start = new Date();
        today_start.setHours(0,0,0,0);
        let today_end = new Date();
        today_end.setHours(23,59,59,999);

        const tweets = await getTweetsByUser(userTest.username, '', 10, today_start, today_end);

        for (const tweet of tweets.tweets) {
            checkTweetFormat(tweet);
            const time = new Date(tweet.time);
            expect( time >= today_start ).toBeTruthy();
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di fine prima di data d'inizio", async function () {
        try {
            await getTweetsByUser(userTest.username, '', 10, '2022-11-05T11:12:31Z', '2022-11-01T15:20:12Z');
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });

    test("Ricerca tweet per username in intervallo temporale con data di inizio nel futuro", async function () {
        try {
            await getTweetsByUser(userTest.username, '', 10, future);
        } catch (error) {
            return expect( error ).toBeDefined();
        }
        throw new Error('Eccezione non lanciata');
    });
});
