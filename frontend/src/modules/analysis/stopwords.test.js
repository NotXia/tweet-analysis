import nock from "nock";
process.env.REACT_APP_API_PATH = "http://localhost";

import { removeStopwords } from "./stopwords";


describe("Rimozione di stop words", function () {
    test("Tweet senza specificare lingua", async function () {
        nock("http://localhost")
            .get('/analysis/stopwords').query({ tweet: "Buonasera a tutti, ho preparato l'acqua calda #reazioneacatena" })
            .reply(200, { sentence: "Buonasera tutti preparato acqua calda #reazioneacatena" });

        expect( await removeStopwords("Buonasera a tutti, ho preparato l'acqua calda #reazioneacatena") ).toEqual("Buonasera tutti preparato acqua calda #reazioneacatena");
    });

    test("Tweet senza tweet", async function () {
        nock("http://localhost")
            .get('/analysis/stopwords').query({ })
            .reply(400, { tweet: "Valore mancante" });

        try {
            await removeStopwords();
            fail("Eccezione non lanciata");
        }
        catch (err) {
            expect(err.response.status).toEqual(400);
        }
    });
});