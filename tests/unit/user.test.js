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

describe("Test ricerca tweet dato username utente", function () {
    test("Controllo esistenza utente", function () {
        expect( userTest.username ).toBeDefined();
    });

    test("Ricerca tweet per username utente senza pagination token", async function () {
        const tweets = await user_module.getTweetsByUser(userTest.username);
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
        const tweetsPage1 = await user_module.getTweetsByUser(userTest.username);
        expect( tweetsPage1.next_token ).toBeDefined();
        const tweetsPage2 = await user_module.getTweetsByUser(userTest.username, tweetsPage1.next_token);
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
