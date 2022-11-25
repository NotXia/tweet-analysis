require("dotenv").config();
const moment = require('moment');
const { generateParams, generateTweets, nockTwitterUsersByUsername } = require("../utils/tweet.js");
import nock from "nock";

moment().format();

const { getTweetsByUser, testing } = require("../../modules/fetch/user.js");

let userTest;
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

describe("Test ricerca nome utente", function () {
    test("Controllo esistenza utente", async function () {
        nockTwitterUsersByUsername("wwe");
        const user = await testing.usr_fetch("wwe");
        expect( user.name ).toBeDefined();
        expect( user.username ).toBeDefined();
        expect( user.profile_image_url ).toBeDefined();
        userTest = user;
    });

    test("Controllo conformità username", async function () {
        const username1 = "Luigi82724358";
        nock("https://api.twitter.com") 
                .get(`/2/users/by/username/Luigi82724358`).query({'user.fields': 'name,username,profile_image_url'})
                .reply(200, {
                    "data": {
                        username: username1,
                        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
                        name: "Luigi",
                        id: "1669400687625281497"
                    }
                });
        const user1 = await testing.usr_fetch(username1);

        const username2 = "  Luigi82724358    ";
        nock("https://api.twitter.com") 
            .get(`/2/users/by/username/Luigi82724358`).query({'user.fields': 'name,username,profile_image_url'})
            .reply(200, {
                "data": {
                    username: username1,
                    profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
                    name: "Luigi",
                    id: "1669400687625281497"
                }
            });
        const user2 = await testing.usr_fetch(username2);

        const username3 = " @ Luigi82724358    ";
        nock("https://api.twitter.com") 
            .get(`/2/users/by/username/Luigi82724358`).query({'user.fields': 'name,username,profile_image_url'})
            .reply(200, {
                "data": {
                    username: username1,
                    profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
                    name: "Luigi",
                    id: "1669400687625281497"
                }
            });
        const user3 = await testing.usr_fetch(username3);

        expect( user1 ).toBeDefined();
        expect( user2 ).toBeDefined();
        expect( user2 ).toBeDefined();
        expect( user3 ).toBeDefined();
        expect( user1 ).toEqual( user2 );
        expect( user1 ).toEqual( user2 );
        expect( user1 ).toEqual( user3 );
    });
});

describe("Test ricerca tweet dato username utente", function () {
    test("Controllo esistenza utente", function () {
        expect( userTest.username ).toBeDefined();
    });

    test("Ricerca tweet per username utente senza pagination token", async function () {
        nockTwitterUsersByUsername("sweteam12");
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:sweteam12"))
            .reply(200, generateTweets(10) );
        const tweets = await getTweetsByUser('sweteam12');
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
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
    });

    test("Ricerca tweet per username utente con pagination token", async function () {
        nockTwitterUsersByUsername(userTest.username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`))
            .reply(200, generateTweets(10) );
        const tweetsPage1 = await getTweetsByUser(userTest.username);
        expect( tweetsPage1.next_token ).toBeDefined();

        nockTwitterUsersByUsername(userTest.username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`, tweetsPage1.next_token))
            .reply(200, generateTweets(10) );
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
            if (tweet.location) {
                expect( tweet.location.id ).toBeDefined();
                expect( tweet.location.full_name ).toBeDefined();
                expect( tweet.location.country ).toBeDefined();
                expect( tweet.location.coords.long ).toBeDefined();
                expect( tweet.location.coords.lat ).toBeDefined();
            }
        }
    });

    test("Ricerca tweet per username in intervallo temporale con date valide", async function () {
        nockTwitterUsersByUsername(userTest.username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`, "", 20, date1.toISOString(), date2.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), date2.toISOString()) );

        const tweets = await getTweetsByUser(userTest.username, '', 20, date1, date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con solo data d'inizio", async function () {
        nockTwitterUsersByUsername(userTest.username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`, "", 20, date1.toISOString()))
            .reply(200, generateTweets(20, false, date1.toISOString(), new Date()) );

        const tweets = await getTweetsByUser(userTest.username, '', 20, date1);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time >= date1 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con solo data di fine", async function () {
        nockTwitterUsersByUsername(userTest.username);
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`, "", 20, "", date2.toISOString()))
            .reply(200, generateTweets(20, false, "1970-01-01T00:00:01Z", date2.toISOString()) );

        const tweets = await getTweetsByUser(userTest.username, '', 20, '', date2);
        for (const tweet of tweets.tweets) {
            const time = new Date(tweet.time);
            expect( time <= date2 ).toBeTruthy();
        }
    });

    test("Ricerca tweet per username in intervallo temporale con date coincidenti", async function () {
        try {
            nockTwitterUsersByUsername(userTest.username);
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`, "", 20, date1.toISOString(), date1.toISOString()))
                .reply(400);
            await getTweetsByUser(userTest.username, '', 20, date1, date1);
        }
        catch (err) {
            expect(err).toBeDefined();
            return;
        }
        throw new Error("Eccezione non lanciata - Estremi intervallo coincidenti");
    });


    test("Ricerca tweet per username utente vuoto", async function () {
        try {
            nockTwitterUsersByUsername("");
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams(`from:`, ""))
                .reply(500);
            await getTweetsByUser('');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per username errato", async function () {
        try {
            nockTwitterUsersByUsername("sdfsdgfaaaaasd");
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams(`from:sdfsdgfaaaaasd`, ""))
                .reply(500);
            await getTweetsByUser('sdfsdgfaaaaasd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca tweet per pagination token errato", async function () {
        try {
            nockTwitterUsersByUsername(userTest.username);
            nock("https://api.twitter.com")
                .get('/2/tweets/search/all').query(generateParams(`from:${userTest.username}`, "dasfdasfsd"))
                .reply(500);
            await getTweetsByUser(userTest.username, 'dasfdasfsd');
            fail('Eccezione non lanciata');
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
});
