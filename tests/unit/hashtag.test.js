require("dotenv").config();

const hashtag_module = require("../../modules/fetch/hashtag.js");

describe("Test ricerca Tweet dato hashtag", function () {
    test("#ReazioneACatena", async function () {
        expect( await hashtag_module("reazioneacatena") ).toBeDefined();
    });
});