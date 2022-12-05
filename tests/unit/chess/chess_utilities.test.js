require("dotenv").config();
const { generateBoardImage, normalizePromotionString, parseMoveString } = require("../../../modules/chess/utilities.js");


describe("Parsing stringa con mossa", function () {
    test("Normalizzazione promozione", function () {
        expect( normalizePromotionString("queen") ).toEqual("q");
        expect( normalizePromotionString("q") ).toEqual("q");
        expect( normalizePromotionString("KNIGHT") ).toEqual("n");
        expect( normalizePromotionString("rOOk") ).toEqual("r");
        expect( normalizePromotionString(" B I S H O P ") ).toEqual("b");

        expect( normalizePromotionString("Pasticcere") ).toEqual("");
    });

    /**
     * E7 -> E5 : Mossa legale
     * F7 -> F6 : Mossa illegale (pedone bianco blocca)
     * G2 -> G1 : Promozione per pedone nero
     */
    const FEN = "rnbqkbnr/pppppp1P/5PP1/8/8/5N2/PPPPP1p1/RNBQKB1R b KQkq - 0 1";

    test("Normalizzazione mosse corrette", function () {
        expect( parseMoveString("e7 e5", FEN).from ).toEqual("e7");
        expect( parseMoveString("e7 e5", FEN).to ).toEqual("e5");
        expect( parseMoveString("e7 e5", FEN).promotion ).not.toBeDefined();

        expect( parseMoveString("E7 e5", FEN).from ).toEqual("e7");
        expect( parseMoveString("E7 e5", FEN).to ).toEqual("e5");
        expect( parseMoveString("E7 e5", FEN).promotion ).not.toBeDefined();
    });

    test("Normalizzazione mosse errate", function () {
        expect( parseMoveString("f7 f6", FEN) ).toBeNull();
        expect( parseMoveString(" F7 F6 ", FEN) ).toBeNull();
    });

    test("Normalizzazione mosse con promozione", function () {
        expect( parseMoveString("g2 g1 queen", FEN).from ).toEqual("g2");
        expect( parseMoveString("g2 g1 queen", FEN).to ).toEqual("g1");
        expect( parseMoveString("g2 g1 queen", FEN).promotion ).toEqual("q");

        expect( parseMoveString("g2 g1 n", FEN).from ).toEqual("g2");
        expect( parseMoveString("g2 g1 n", FEN).to ).toEqual("g1");
        expect( parseMoveString("g2 g1 n", FEN).promotion ).toEqual("n");

        expect( parseMoveString("g2 g1", FEN) ).toBeNull();
    });
});

describe("Generazione immagine scacchiera", function () {
    test("Generazione con FEN", async function () {
        const image = await generateBoardImage("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        expect( image instanceof Buffer).toBeTruthy();
    }, 15000);
});