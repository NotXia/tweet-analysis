require("dotenv").config();
const describeIf = (condition) => condition ? describe : describe.skip;
// const testIf = (condition) => condition ? test : test.skip;

const sentiment_module = require("../../modules/sentiment.js");


describeIf(sentiment_module.detectLanguage)("Test rilevamento lingua", function () {
    const detectLanguage = sentiment_module.detectLanguage;

    test("Lingua italiana", function () {
        expect( detectLanguage("Questa è una frase in italiano") ).toEqual("it");
        expect( detectLanguage("Questa è una frase in spagnolo") ).toEqual("it");
        expect( detectLanguage("Che burlone che sono", "es") ).toEqual("it"); // Mi aspetto che il bias venga ignorato
    });

    test("Lingua inglese", function () {
        expect( detectLanguage("The table is on the pen") ).toEqual("en");
        expect( detectLanguage(`That Italian guy said "mamma mia, pizzeria"`) ).not.toEqual("en");
        expect( detectLanguage(`That Italian guy said "mamma mia, pizzeria"`, "en") ).toEqual("en");
    });

    test("Lingua araba", function () {
        expect( detectLanguage("لحم الحمام حلال ولحم الحمار حرام") ).toEqual("ar");
    });
});


describeIf(sentiment_module.sentiment)("Test analisi del sentimento", function () {
    const sentiment = sentiment_module.sentiment;
    let sentiment_res;

    test("Frasi positive", async function () {
        sentiment_res = await sentiment("I triceratopi sono belli", { language: "it" });
        expect(sentiment_res.sentiment).toEqual("positive");
        expect(sentiment_res.language).toEqual("it");

        sentiment_res = await sentiment("Che cosa super mega fantastica", { language: "it" });
        expect(sentiment_res.sentiment).toEqual("positive");
        expect(sentiment_res.language).toEqual("it");

        sentiment_res = await sentiment("I like that tomato");
        expect(sentiment_res.sentiment).toEqual("positive");
        expect(sentiment_res.language).toEqual("en");

        sentiment_res = await sentiment("J'adore les chaises");
        expect(sentiment_res.sentiment).toEqual("positive");
        expect(sentiment_res.language).toEqual("fr");

        sentiment_res = await sentiment(`I love to hear "Fai terribilmente schifo"`, { language: "en" });
        expect(sentiment_res.sentiment).toEqual("positive");
        expect(sentiment_res.language).toEqual("en");
        sentiment_res = await sentiment(`I love to hear "Fai terribilmente schifo"`, { bias: "en" });
        expect(sentiment_res.sentiment).toEqual("positive");
        expect(sentiment_res.language).toEqual("en");
    });

    test("Frasi neutre", async function () {
        sentiment_res = await sentiment("Arrivederci", { language: "it" });
        expect(sentiment_res.sentiment).toEqual("neutral");
        expect(sentiment_res.language).toEqual("it");

        sentiment_res = await sentiment("Si trova al secondo piano");
        expect(sentiment_res.sentiment).toEqual("neutral");
        expect(sentiment_res.language).toEqual("it");

        sentiment_res = await sentiment("The pen is on the table");
        expect(sentiment_res.sentiment).toEqual("neutral");
        expect(sentiment_res.language).toEqual("en");
    });

    test("Frasi negative", async function () {
        sentiment_res = await sentiment("Fai schifo", { language: "it" });
        expect(sentiment_res.sentiment).toEqual("negative");
        expect(sentiment_res.language).toEqual("it");

        sentiment_res = await sentiment(`I love to hear "Fai terribilmente schifo"`, { language: "it" });
        expect(sentiment_res.sentiment).toEqual("negative");
        expect(sentiment_res.language).toEqual("it");
        sentiment_res = await sentiment(`I love to hear "Fai terribilmente schifo"`, { bias: "it" });
        expect(sentiment_res.sentiment).toEqual("negative");
        expect(sentiment_res.language).toEqual("it");

        sentiment_res = await sentiment("Война это плохо", { language: "ru" });
        expect(sentiment_res.sentiment).toEqual("negative");
        expect(sentiment_res.language).toEqual("ru");
    });
});