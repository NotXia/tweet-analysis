require("dotenv").config();

const getTweetsByUser = require("../../modules/fetch/user.js");
const user_module = require("../../modules/fetch/user.js");

let userTest;

describe("Test ricerca nome utente", function () {
    test("Controllo esistenza utente", async function () {
        const user = await user_module.usr_fetch("wwe");
        expect( user.name ).toBeDefined();
        expect( user.username ).toBeDefined();
        expect( user.profile_image_url ).toBeDefined();
        userTest = user;
    });

    test("Controllo conformità username", async function () {
        const user1 = await user_module.usr_fetch("Luigi82724358");
        const user2 = await user_module.usr_fetch("LUIGI82724358");
        expect( user1 ).toBeDefined();
        expect( user2 ).toBeDefined();
        expect( user1 ).toEqual( user2 );
    });
});

describe("Test ricerca tweet dato ID utente", function () {
    test("Controllo esistenza utente", function () {
        expect( userTest.id ).toBeDefined();
    });

    test("Ricerca tweet per ID utente senza pagination token", async function () {
        try {
            const tweets = await user_module.twt_fetch(userTest.id);
            expect( tweets.data ).toBeDefined();
            expect( tweets.data[0].id ).toBeDefined();
            expect( tweets.data[0].text ).toBeDefined();
            expect( tweets.data[0].public_metrics ).toBeDefined();
        } catch ( error ) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per ID utente con pagination token", async function () {
        try {
            const tweetsPage1 = await user_module.twt_fetch(userTest.id);
            expect( tweetsPage1.meta.next_token ).toBeDefined();
            const tweetsPage2 = await user_module.twt_fetch(userTest.id, tweetsPage1.meta.next_token);
            expect( tweetsPage2.data ).toBeDefined();
            expect( tweetsPage2.data[0].id ).toBeDefined();
            expect( tweetsPage2.data[0].text ).toBeDefined();
            expect( tweetsPage2.data[0].public_metrics ).toBeDefined();
        } catch ( error ) {
            expect( error ).toBeDefined();
        }
    });

    // test("Ricerca tweet per ID utente con pagination token sbagliato", async function () {
    //     const tweets = await user_module.twt_fetch(userTest.id, 'dgsfdsfg');
    //     console.log(tweets);
    // });
});

describe("Test ricerca tweet dato username utente", function () {
    test("Controllo esistenza utente", function () {
        expect( userTest.username ).toBeDefined();
    });

    test("Ricerca tweet per username utente senza pagination token", async function () {
        try {
            const tweets = await user_module.getTweetsByUser(userTest.username);
            expect( tweets.tweets[0].name ).toBeDefined();
            expect( tweets.tweets[0].username ).toBeDefined();
            expect( tweets.tweets[0].pfp ).toBeDefined();
            expect( tweets.tweets[0].text ).toBeDefined();
            expect( tweets.tweets[0].time ).toBeDefined();
            expect( tweets.tweets[0].likes ).toBeDefined();
            expect( tweets.tweets[0].comments ).toBeDefined();
            expect( tweets.tweets[0].retweets ).toBeDefined();
            expect( tweets.tweets[0].location ).toBeDefined();
            expect( tweets.tweets[0].media ).toBeDefined();
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username utente con pagination token", async function () {
        try {
            const tweetsPage1 = await user_module.getTweetsByUser(userTest.username);
            expect( tweetsPage1.next_token ).toBeDefined();
            const tweetsPage2 = await user_module.getTweetsByUser(userTest.username, tweetsPage1.next_token);
            expect( tweetsPage2.tweets[0].name ).toBeDefined();
            expect( tweetsPage2.tweets[0].username ).toBeDefined();
            expect( tweetsPage2.tweets[0].pfp ).toBeDefined();
            expect( tweetsPage2.tweets[0].text ).toBeDefined();
            expect( tweetsPage2.tweets[0].time ).toBeDefined();
            expect( tweetsPage2.tweets[0].likes ).toBeDefined();
            expect( tweetsPage2.tweets[0].comments ).toBeDefined();
            expect( tweetsPage2.tweets[0].retweets ).toBeDefined();
            expect( tweetsPage2.tweets[0].location ).toBeDefined();
            expect( tweetsPage2.tweets[0].media ).toBeDefined();
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username utente vuoto", async function () {
        try {
            await user_module.getTweetsByUser('');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username errato", async function () {
        try {
            await user_module.getTweetsByUser('sdfsdgfaaaaasd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per pagination token errato", async function () {
        try {
            await user_module.getTweetsByUser(userTest.username, 'dasfdasfsd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username errato e pagination token errato", async function () {
        try {
            await user_module.getTweetsByUser('adfdasdsgsg', 'dasfdasfsd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
});
