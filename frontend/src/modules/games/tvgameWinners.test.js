import nock from "nock";
process.env.REACT_APP_API_PATH = "http://localhost";
import moment from "moment";
import { getWinners, getMostWinningFrom } from "./tvgameWinners.js";
import { getGhigliottinaAttempts, getGhigliottinaWord } from "./ghigliottinaGame.js";
import { getCatenaFinaleAttempts, getCatenaFinaleWord } from "./catenaFinaleGame";


describe("Estrazione vincitori", function () {
    test("Richiesta senza duplicazioni", function () {
        const tweets = [
            { tweet: { username: "Utente1" }, word: "ciao" },
            { tweet: { username: "Utente2" }, word: "prato" },
            { tweet: { username: "Utente3" }, word: "abaco" },
            { tweet: { username: "Utente4" }, word: "idropulitrice a pressione" },
            { tweet: { username: "Utente5" }, word: "ciao" },
            { tweet: { username: "Utente6" }, word: "sasso" },
            { tweet: { username: "Utente7" }, word: "ciao" },
            { tweet: { username: "Utente8" }, word: "roccia" }
        ];
        const winning_word = "ciao";

        let winners = getWinners(tweets, winning_word);
        expect( winners.length ).toEqual(3);
        expect( winners[0].username ).toEqual("Utente7");
        expect( winners[1].username ).toEqual("Utente5");
        expect( winners[2].username ).toEqual("Utente1");
    });

    test("Richiesta con duplicazioni", function () {
        const tweets = [
            { tweet: { username: "Utente1" }, word: "ciao" },
            { tweet: { username: "Utente1" }, word: "prato" },
            { tweet: { username: "Utente1" }, word: "abaco" },
            { tweet: { username: "Utente1" }, word: "idropulitrice a pressione" },
            { tweet: { username: "Utente2" }, word: "ciao" },
            { tweet: { username: "Utente1" }, word: "ciao" },
        ];
        const winning_word = "ciao";

        let winners = getWinners(tweets, winning_word);
        expect( winners.length ).toEqual(2);
        expect( winners[0].username ).toEqual("Utente1");
        expect( winners[1].username ).toEqual("Utente2");
    });

    test("Richiesta vuota", function () {
        const tweets = [];
        const winning_word = "ciao";

        let winners = getWinners(tweets, winning_word);
        expect( winners.length ).toEqual(0);
    });

    test("Richiesta senza parola vincente", function () {
        const tweets = [];
        const winning_word = "";

        let winners = getWinners(tweets, winning_word);
        expect( winners.length ).toEqual(0);
    });
});


function nockAttemps(endpoint, date, tweets) {
    nock("http://localhost").get(endpoint).query({ 
        date: moment(date).utc().startOf("day").toISOString()
    }).reply(200, {
        tweets: tweets
    });
}

function nockWinningWord(endpoint, date, word) {
    nock("http://localhost").get(endpoint).query({ 
        date: moment(date).utc().startOf("day").toISOString()
    }).reply(200, { word: word });
}

describe("Estrazione più vincenti - Ghigliottina", function () {
    test("Richiesta corretta", async function () {
        nockAttemps("/games/ghigliottina", "2050-01-01T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "ciao" },
            { tweet: { username: "Utente2",  }, word: "ciao" },
            { tweet: { username: "Utente3",  }, word: "ciao" }
        ]);
        nockWinningWord("/games/ghigliottina/winning_word", "2050-01-01T12:00:00.000Z", "ciao");

        nockAttemps("/games/ghigliottina", "2050-01-02T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "carpa" },
            { tweet: { username: "Utente2",  }, word: "tonno" },
            { tweet: { username: "Utente3",  }, word: "tonno" }
        ]);
        nockWinningWord("/games/ghigliottina/winning_word", "2050-01-02T12:00:00.000Z", "tonno");

        nockAttemps("/games/ghigliottina", "2050-01-03T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "scarpa" },
            { tweet: { username: "Utente2",  }, word: "mascarpone" },
            { tweet: { username: "Utente3",  }, word: "sciarpa" }
        ]);
        nockWinningWord("/games/ghigliottina/winning_word", "2050-01-03T12:00:00.000Z", "sciarpa");
        
        const winners = await getMostWinningFrom("2050-01-03T12:00:00.000Z", "2050-01-01T12:00:00.000Z", getGhigliottinaAttempts, getGhigliottinaWord);
        expect( winners.length ).toEqual(2);
        expect( winners[0].tweet.username ).toEqual("Utente3");
        expect( winners[0].times ).toEqual(3);
        expect( winners[1].tweet.username ).toEqual("Utente2");
        expect( winners[1].times ).toEqual(2);
    });

    test("Richiesta senza vincitori multipli", async function () {
        nockAttemps("/games/ghigliottina", "2050-01-01T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "ciao" },
        ]);
        nockWinningWord("/games/ghigliottina/winning_word", "2050-01-01T12:00:00.000Z", "ciao");

        nockAttemps("/games/ghigliottina", "2050-01-02T12:00:00.000Z", [
            { tweet: { username: "Utente2",  }, word: "tonno" },
        ]);
        nockWinningWord("/games/ghigliottina/winning_word", "2050-01-02T12:00:00.000Z", "tonno");

        nockAttemps("/games/ghigliottina", "2050-01-03T12:00:00.000Z", [
            { tweet: { username: "Utente3",  }, word: "sciarpa" }
        ]);
        nockWinningWord("/games/ghigliottina/winning_word", "2050-01-03T12:00:00.000Z", "sciarpa");
        
        const winners = await getMostWinningFrom("2050-01-03T12:00:00.000Z", "2050-01-01T12:00:00.000Z", getGhigliottinaAttempts, getGhigliottinaWord);
        expect( winners.length ).toEqual(0);
    });
});

describe("Estrazione più vincenti - Catena finale", function () {
    test("Richiesta corretta", async function () {
        nockAttemps("/games/catenaFinale", "2050-01-01T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "ciao" },
            { tweet: { username: "Utente2",  }, word: "ciao" },
            { tweet: { username: "Utente3",  }, word: "ciao" }
        ]);
        nockWinningWord("/games/catenafinale/winning_word", "2050-01-01T12:00:00.000Z", "ciao");

        nockAttemps("/games/catenaFinale", "2050-01-02T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "carpa" },
            { tweet: { username: "Utente2",  }, word: "tonno" },
            { tweet: { username: "Utente3",  }, word: "tonno" }
        ]);
        nockWinningWord("/games/catenafinale/winning_word", "2050-01-02T12:00:00.000Z", "tonno");

        nockAttemps("/games/catenaFinale", "2050-01-03T12:00:00.000Z", [
            { tweet: { username: "Utente1",  }, word: "scarpa" },
            { tweet: { username: "Utente2",  }, word: "mascarpone" },
            { tweet: { username: "Utente3",  }, word: "sciarpa" }
        ]);
        nockWinningWord("/games/catenafinale/winning_word", "2050-01-03T12:00:00.000Z", "sciarpa");
        
        const winners = await getMostWinningFrom("2050-01-03T12:00:00.000Z", "2050-01-01T12:00:00.000Z", getCatenaFinaleAttempts, getCatenaFinaleWord);
        expect( winners.length ).toEqual(2);
        expect( winners[0].tweet.username ).toEqual("Utente3");
        expect( winners[0].times ).toEqual(3);
        expect( winners[1].tweet.username ).toEqual("Utente2");
        expect( winners[1].times ).toEqual(2);
    });
});