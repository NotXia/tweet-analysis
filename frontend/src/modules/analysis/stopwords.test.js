// import nock from "nock";
process.env.REACT_APP_API_PATH = "http://localhost";

import { removeStopwords } from "./stopwords";


describe("Rimozione di stop words", function () {
    test("Tweet senza specificare lingua", async function () {
        expect( await removeStopwords("Buonasera a tutti, ho preparato l'acqua calda #reazioneacatena") ).toEqual("Buonasera preparato acqua calda #reazioneacatena");
    });
});