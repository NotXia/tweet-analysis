require("dotenv").config();

const hashtag_module = require("../../modules/fetch/hashtag.js");

describe("Test normalizzazione stringa di hashtag", function () {
    test("Normalizzazione testo con spazi", function () {
        expect( hashtag_module.normalizeHashtag("stringa con spazi") ).toEqual("stringaconspazi");
        expect( hashtag_module.normalizeHashtag("    stringa con spazi    ") ).toEqual("stringaconspazi");
    });

    test("Normalizzazione testo con #", function () {
        expect( hashtag_module.normalizeHashtag("#stringa") ).toEqual("stringa");
    });
});

describe("Test ricerca tweet dato hashtag", function () {
    test("Ricerca tweet per hashtag senza pagination token", async function () {
        const tweets = await hashtag_module.getTweetsByHashtag("reazioneacatena");
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
    });

    test("Ricerca tweet per hashtag con pagination token", async function () {
        const tweetsPage1 = await hashtag_module.getTweetsByHashtag("reazioneacatena");
        expect( tweetsPage1.next_token ).toBeDefined();
        const tweetsPage2 = await hashtag_module.getTweetsByHashtag("reazioneacatena", tweetsPage1.next_token);
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
    });
});

describe("Test ricerca tweet dato hashtag vuoto", function () {
    test("Ricerca tweet con hashtag vuoto", async function () {
        try {
            await hashtag_module.getTweetsByHashtag("");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
});