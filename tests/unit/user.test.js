require("dotenv").config();

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

    test("Ricerca tweet per ID utente", async function () {
        const tweets = await user_module.twt_fetch(userTest.id);
        expect( tweets.data ).toBeDefined();
        expect( tweets.data[0].id ).toBeDefined();
        expect( tweets.data[0].text ).toBeDefined();
        expect( tweets.data[0].public_metrics ).toBeDefined();
    });
});

describe("Test ricerca tweet dato username utente", function () {
    test("Controllo esistenza utente", function () {
        expect( userTest.username ).toBeDefined();
    });

    test("Ricerca tweet per username utente", async function () {
        const tweets = await user_module.getTweetsByUser(userTest.username);

        tweets.tweets.forEach(tweet => {
            console.log(tweet.media);
        });
        // for(const tweet in tweets.tweets) {
        //     console.log(tweet);
        // }
        // expect( tweets.data ).toBeDefined();
        // expect( tweets.data[0].id ).toBeDefined();
        // expect( tweets.data[0].text ).toBeDefined();
        // expect( tweets.data[0].public_metrics ).toBeDefined();
    });
});

describe("Test ricerca tweet con pagination_token dato username utente", function () {
    test("Controllo esistenza utente", function () {
        expect( userTest.username ).toBeDefined();
    });

    test("Ricerca tweet per username utente", async function () {
        const tweets = await user_module.twt_fetch_nxtpage(userTest.username, undefined);

        // tweets.tweets.forEach(tweet => {
        //     console.log(tweet.media);
        // });
    });
});
