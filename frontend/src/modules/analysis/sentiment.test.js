import nock from "nock";
process.env.REACT_APP_API_PATH = "http://localhost";

import { sentiment } from "./sentiment";


describe("Analisi del sentimento", function () {
    test("Richiesta corretta senza opzioni", async function () {
        nock("http://localhost")
            .get("/analysis/sentiment").query({ tweet: "Frase decisamente felice" })
            .reply(200, { sentiment: "positive", score: 5, language: "it" });

        const res = await sentiment("Frase decisamente felice");
        expect( res.sentiment ).toEqual("positive");
        expect( res.score ).toEqual(5);
        expect( res.language ).toEqual("it");
    });

    test("Richiesta corretta con opzioni", async function () {
        nock("http://localhost")
            .get("/analysis/sentiment").query({ tweet: "Frase decisamente felice", lang: "fr" })
            .reply(200, { sentiment: "negative", score: -1000, language: "fr" });

        const res = await sentiment("Frase decisamente felice", { language: "fr" });
        expect( res.sentiment ).toEqual("negative");
        expect( res.score ).toEqual(-1000);
        expect( res.language ).toEqual("fr");
    });
});