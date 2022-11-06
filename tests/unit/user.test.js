require("dotenv").config();
const moment = require('moment');
moment().format();

const { getTweetsByUser, testing } = require("../../modules/fetch/user.js");

let userTest;
const limit = new Date('2010-11-06T00:00:01Z');
const today = new Date();
let future = new Date();
future = new Date(moment(future).add(7, 'days'));

describe("Test ricerca nome utente", function () {
    test("Controllo esistenza utente", async function () {
        const user = await testing.usr_fetch("wwe");
        expect( user.name ).toBeDefined();
        expect( user.username ).toBeDefined();
        expect( user.profile_image_url ).toBeDefined();
        userTest = user;
    });

    test("Controllo conformità username", async function () {
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
    test("Controllo esistenza utente", function () {
        expect( userTest.username ).toBeDefined();
    });

    test("Ricerca tweet per username utente senza pagination token", async function () {
        const tweets = await getTweetsByUser(userTest.username);
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

    test("Ricerca tweet per username utente con pagination token", async function () {
        const tweetsPage1 = await getTweetsByUser(userTest.username);
        expect( tweetsPage1.next_token ).toBeDefined();
        const tweetsPage2 = await getTweetsByUser(userTest.username, tweetsPage1.next_token);
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

    test("Ricerca tweet per username in intervallo temporale con date valide", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, '2022-11-01T15:20:12Z', '2022-11-05T11:12:31Z');
        for (const tweet of tweets.tweets) {
            expect( tweet.time >= '2022-11-01T00:00:00.000Z' ).toBeTruthy();
            expect( tweet.time <= '2022-11-05T23:59:59.999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con solo data d'inizio", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, '2022-11-01T15:20:12Z');
        for (const tweet of tweets.tweets) {
            expect( tweet.time >= '2022-11-01T00:00:00:000Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con solo data di fine", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, '', '2022-11-05T11:12:31Z');
        for (const tweet of tweets.tweets) {
            expect( tweet.time <= '2022-11-05T23:59:59:999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di inizio prima del limite", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, '2009-11-06T00:00:01Z', '2022-11-05T11:12:31Z');
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= limit ).toBeTruthy();
            expect( tweet.time <= '2022-11-05T23:59:59:999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di fine nel futuro", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, '', future);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con date nello stesso giorno", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, '2022-11-01T15:20:12Z', '2022-11-01T17:12:31Z');
        for (const tweet of tweets.tweets) {
            expect( tweet.time >= '2022-11-01T00:00:00:000Z' ).toBeTruthy();
            expect( tweet.time <= '2022-11-01T23:59:59:999Z' ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di inizio e data di fine a oggi", async function () {
        const tweets = await getTweetsByUser(userTest.username, '', 20, today, today);
        const today_start = new Date();
        today_start.setHours(0,0,0,0);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= today_start ).toBeTruthy();
            expect( time <= today ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di fine prima di data d'inizio", async function () {
        try {
            await getTweetsByUser(userTest.username, '', 20, '2022-11-05T11:12:31Z', '2022-11-01T15:20:12Z');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di inizio nel futuro", async function () {
        try {
            await getTweetsByUser(userTest.username, '', 20, future);
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con data di fine prima del limite", async function () {
        try {
            await getTweetsByUser(userTest.username, '', 20, '', '2009-11-06T00:00:01Z');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username utente vuoto", async function () {
        try {
            await getTweetsByUser('');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username errato", async function () {
        try {
            await getTweetsByUser('sdfsdgfaaaaasd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per pagination token errato", async function () {
        try {
            await getTweetsByUser(userTest.username, 'dasfdasfsd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username errato e pagination token errato", async function () {
        try {
            await getTweetsByUser('adfdasdsgsg', 'dasfdasfsd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
});
