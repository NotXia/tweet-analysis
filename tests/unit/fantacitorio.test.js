require("dotenv").config();
const moment = require('moment');
const { generateParams, generateTweets, nockTwitterUsersByUsername } = require("../utils/tweet.js");
import mongoose from "mongoose"
import nock from "nock";

moment().format();

const { getPointsByWeek, getRanking, getSquads, updateScoreOfPolitician, getRankingStatistics, testing } = require("../../modules/games/fantacitorio.js");
const FantacitorioModel = require("../../models/Fantacitorio.js");


const safe_date = moment.utc("2999-01-01T00:00:00.000Z").startOf("isoweek").toISOString();


beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);

    // Inizializzazione per test modifica punteggi
    await FantacitorioModel.cachePoints({ "MELONI GIORGIA": 1, "BERLUSCONI SILVIO": 1 }, safe_date);
});

afterAll(async () => {
    // Pulizia test modifica punteggi
    await FantacitorioModel.findOneAndDelete({ date: safe_date });

    await mongoose.disconnect();
});

describe("Test funzione parsePoints", function() {
    test("Ricerca punti dato un testo regolare", async function () {
        const result = await(testing.parsePoints(`
        400 PUNTI - BARBARA FLORIDIA 

        800 PUNTI A:
        LUIGI NAVE
        ADA LOPREIATO 
        CONCETTA DAMANTE
        GABRIELLA DI GIROLAMO
        SABRINA LICHERI
        ALESSANDRA MAIORINO
        `));
        expect( result['FLORIDIA BARBARA'] ).toEqual(400);
        expect( result['NAVE LUIGI'] ).toEqual(800);
        expect( result['MAIORINO ALESSANDRA'] ).toEqual(800);
    });

    test("Ricerca punti dato un testo con malus", async function () {
        const result = await(testing.parsePoints(`
        MALUS DI 30 PUNTI PER GIANPIERO ZINZI
        `));
        expect( result['ZINZI GIANPIERO'] ).toEqual(-30);
    });

    test("Ricerca punti dato un testo con testo contenente 'o' al posto di 0", async function () {
        const result = await(testing.parsePoints(`
        1OO PUNTI PER SILVIO BERLUSCONI 
        "Alla carriera"
        `));
        expect( result['BERLUSCONI SILVIO'] ).toEqual(100);
    });
})

describe("Test funzione getPointsByWeek", function() {
    test("Ricerca punteggi con una data regolare", async function () {
        const username = "Fanta_citorio";
        const date = moment("2022-11-30T00:00:01Z").utc();

        const tweetText = `
        400 PUNTI - BARBARA FLORIDIA 
        
        800 PUNTI A:
        LUIGI NAVE
        ADA LOPREIATO 
        CONCETTA DAMANTE
        GABRIELLA DI GIROLAMO
        SABRINA LICHERI
        ALESSANDRA MAIORINO
        `
        let batch = generateTweets(2, true, date.startOf("day").toISOString(), date.endOf("day").toISOString(), tweetText, username);
                
        nockTwitterUsersByUsername(username);
        nock("https://api.twitter.com")
        .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
        .reply(200, batch);

        const result = await(getPointsByWeek(date));
        expect( result['FLORIDIA BARBARA'] ).toEqual(800);
        expect( result['NAVE LUIGI'] ).toEqual(1600);
        expect( result['MAIORINO ALESSANDRA'] ).toEqual(1600);
    });

    test("Ricerca punteggi con una data nel futuro", async function () {
        const username = "Fanta_citorio";
        const date = moment("9999-11-30T00:00:01Z").utc();


        try {
            nockTwitterUsersByUsername(username);
            nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
            .reply(200, null);
            await(getPointsByWeek(date));
        } catch (err) {
            expect(err).toBeDefined();
            return;
        }
        throw new Error("Eccezione non lanciata");
    });

    test("Ricerca punteggi con ricerca fallita", async function () {
        const username = "Fanta_citorio";
        const date = moment("2022-11-30T00:00:01Z").utc();

        try {
            nockTwitterUsersByUsername(username);
            nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username}`, "", 500, date.startOf("isoWeek").toISOString(), date.endOf("isoWeek").toISOString()))
            .reply(200, null);
            await(getPointsByWeek(date));
        } catch (err) {
            expect(err).toBeDefined();
            return;
        }
        throw new Error("Eccezione non lanciata");
    });
})

describe("Test funzione getRanking", function() {
    test("Generazione classifica", async function () {
        let ranking = await getRanking();

        expect( ranking ).toBeDefined();
        for (let i = 0; i < ranking.length-1; i++) {
            expect( ranking[i].points ).toBeGreaterThanOrEqual(ranking[i+1].points);
        }
    });

    test("Generazione classifica con data di fine", async function () {
        let ranking = await getRanking("2022-12-08T00:00:00.000Z");

        expect( ranking ).toBeDefined();
        for (let i = 0; i < ranking.length-1; i++) {
            expect( ranking[i].points ).toBeGreaterThanOrEqual(ranking[i+1].points);
        }
    });
})

describe("Test funzione getSquads", function() {
    test("Ricerca squadre senza pagination token e con prima pagina senza squadre trovate", async function () {
        let batch1 = generateTweets(10, false, undefined, undefined, "#fantacitorio test");
        for (let i=1; i<10; i++) { batch1.data[i].attachments.media_keys = []; } // Rimuove le immagini già presenti ai tweet (per velocizzare)
        let batch2 = generateTweets(5, true, undefined, undefined, "#fantacitorio test");
        for (let i=0; i<5; i++) { batch2.data[i].attachments.media_keys = []; } // Rimuove le immagini già presenti ai tweet (per velocizzare)
        batch2.data[2].attachments.media_keys[0] = '3_1111122222333334444';
        batch2.data[4].attachments.media_keys[0] = '3_2222233333444411111';
        batch2.includes.media[0].media_key = '3_1111122222333334444';
        batch2.includes.media[0].url = 'https://pbs.twimg.com/media/Fi6jtjhXgBswzlx.jpg';
        batch2.includes.media[1].media_key = '3_2222233333444411111';
        batch2.includes.media[1].url = 'https://pbs.twimg.com/media/Fi60YlyXgAAZX7C.jpg';

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#fantacitorio", "", 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(200, batch1);
        
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#fantacitorio", batch1.meta.next_token, 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(200, batch2);

        const result = await(getSquads());
        expect( result.tweets.length ).toEqual(2);
        expect( result.next_token ).toBeDefined();
        for (const tweet of result.tweets) {
            expect( tweet.tweet ).toBeDefined();
            expect( tweet.squad ).toBeDefined();
        }
    }, 90000);

    test("Ricerca squadre con pagination token", async function () {
        let batch1 = generateTweets(10, false, undefined, undefined, "#fantacitorio test");
        for (let i=0; i<10; i++) { batch1.data[i].attachments.media_keys = []; } // Rimuove le immagini già presenti ai tweet (per velocizzare)
        let batch2 = generateTweets(3, true, undefined, undefined, "#fantacitorio test");
        for (let i=0; i<3; i++) { batch2.data[i].attachments.media_keys = []; } // Rimuove le immagini già presenti ai tweet (per velocizzare)
        batch2.data[2].attachments.media_keys[0] = '3_1111122222333334444';
        batch2.includes.media[0].media_key = '3_1111122222333334444';
        batch2.includes.media[0].url = 'https://pbs.twimg.com/media/Fi6jtjhXgBswzlx.jpg';

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#fantacitorio", "", 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(200, batch1);
        
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#fantacitorio", batch1.meta.next_token, 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(200, batch2);

        const result = await(getSquads(batch1.meta.next_token));
        expect( result.tweets.length ).toEqual(1);
        expect( result.next_token ).toBeDefined();
        for (const tweet of result.tweets) {
            expect( tweet.tweet ).toBeDefined();
            expect( tweet.squad ).toBeDefined();
        }
    }, 25000);

    test("Ricerca squadre per username", async function () {
        let username = 'SWETeam12';
        let batch = generateTweets(10, true, undefined, undefined, "#fantacitorio test");
        for (let i=0; i<10; i++) { batch.data[i].attachments.media_keys = []; } // Rimuove le immagini già presenti ai tweet (per velocizzare)
        batch.data[2].attachments.media_keys[0] = '3_1111122222333334444';
        batch.includes.media[0].media_key = '3_1111122222333334444';
        batch.includes.media[0].url = 'https://pbs.twimg.com/media/Fi6jtjhXgBswzlx.jpg';

        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams(`from:${username} #fantacitorio`, "", 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(200, batch);

        const result = await(getSquads("", username));
        expect( result.tweets.length ).toEqual(1);
        expect( result.next_token ).toBeUndefined();
        for (const tweet of result.tweets) {
            expect( tweet.tweet ).toBeDefined();
            expect( tweet.squad ).toBeDefined();
        }
    }, 25000);

    test("Ricerca squadre con pagination token errato", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("#fantacitorio", "asfasgfdg", 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(500);
        try {
            await(getSquads("asfasgfdg"));
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });

    test("Ricerca squadre con username inesistente", async function () {
        nock("https://api.twitter.com")
            .get('/2/tweets/search/all').query(generateParams("from:dfadfsdfdfsd1212sweteam12 #fantacitorio", "", 10, "2006-03-26T00:00:02.000Z", "", true))
            .reply(500);
        try {
            await(getSquads("", "dfadfsdfdfsd1212sweteam12"));
            fail("Eccezione non lanciata");
        } catch (error) {
            expect( error ).toBeDefined();
        }
    });
})

describe("Test funzione aggiornamento punteggi politici", function() {
    test("Aggiornamento politico già presente", async function () {
        await updateScoreOfPolitician("G. Meloni", 2, safe_date);

        const data = await FantacitorioModel.getPointsOfWeek(safe_date);
        expect( data["MELONI GIORGIA"] ).toEqual(2);
        expect( data["BERLUSCONI SILVIO"] ).toEqual(1);
    });

    test("Aggiornamento politico non presente originariamente", async function () {
        await updateScoreOfPolitician("Renzi M.", 2, safe_date);

        const data = await FantacitorioModel.getPointsOfWeek(safe_date);
        expect( data["MELONI GIORGIA"] ).toEqual(2);
        expect( data["BERLUSCONI SILVIO"] ).toEqual(1);
        expect( data["RENZI MATTEO"] ).toEqual(2);
    });
});


describe("Test generazione statistiche", function() {
    test("Generazione statistiche", async function () {
        const statistics = await getRankingStatistics();

        expect( statistics.best_single_score ).toBeDefined();
        expect( statistics.best_average ).toBeDefined();
        expect( statistics.best_climber ).toBeDefined();
    });
});
