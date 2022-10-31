require("dotenv").config();

const { removeStopWords } = require("../../modules/analysis/stopwords");


describe("Rimozione stop words", function () {
    test("Lingua italiana", function () {
        expect( removeStopWords("Questa è una frase in italiano") ).toEqual("frase italiano");
        expect( removeStopWords("Vorrei un po' di limone all'arancia, grazie") ).toEqual("Vorrei limone arancia");
        expect( removeStopWords(`  "Chi troppo nulla, tutto niente" - Un saggio  `) ).toEqual("saggio");
    });

    test("Lingua inglese", function () {
        expect( removeStopWords("This is a sentence in English") ).toEqual("sentence English");
        expect( removeStopWords("Ma'am I'm looking for a flying tomato") ).toEqual("flying tomato");
        expect( removeStopWords("Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo") ).toEqual("Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo");
    });

    test("Utilizzo opzioni lingua", function () {
        expect( removeStopWords("Non so cosa mangiare", { language: "en" }) ).toEqual("cosa mangiare"); // 'so' è una stop word inglese
        expect( removeStopWords("Non so cosa mangiare", { language: "it" }) ).toEqual("so mangiare");
        expect( removeStopWords("Burro", { bias: "it" }) ).toEqual("Burro");
    });

    test("Lingua inesistente", function () {
        expect( removeStopWords("aaaaaaaaaaa aaaaaaa aaaaaaaaaaa a aaaaaa", { language: "null" }) ).toEqual("aaaaaaaaaaa aaaaaaa aaaaaaaaaaa a aaaaaa");
    });
});