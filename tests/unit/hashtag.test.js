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
    test("Ricerca tweet per hashtag senza pagination token - hashtag senza tweet", async function () {
        try {
            await hashtag_module.getTweetsByHashtag("asdijaosjasdac31284fh92381dsa");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per hashtag con pagination token", async function () {
        const tweetsPage1 = await hashtag_module.getTweetsByHashtag("reazioneacatena");
        expect( tweetsPage1.next_token ).toBeDefined();
        const tweetsPage2 = await hashtag_module.getTweetsByHashtag("reazioneacatena", tweetsPage1.next_token);
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

    test("Ricerca tweet per hashtag con pagination token sbagliato", async function () {
        try {
            await hashtag_module.getTweetsByHashtag("reazioneacatena", "dsifj");
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
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