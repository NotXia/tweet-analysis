import '@testing-library/jest-dom';
import { render, screen, waitFor } from "@testing-library/react";
import nock from "nock";
process.env.REACT_APP_API_PATH = "http://localhost";

import Sentiment from "./index";


beforeAll(() => {
    console.error = () => {};
})

describe("Modalità testuale", function () {
    test("Testo di default", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(200, { sentiment: "negative", score: 3, language: "it" });

        render(<Sentiment tweet="Tweet tweet" />);
        expect( await screen.findByText("☹️") ).toBeInTheDocument();
    });

    test("Modalità esplicita", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(200, { sentiment: "neutral", score: 3, language: "it" });

        render(<Sentiment tweet="Tweet tweet" text positive="Ciao mondo" negative="Addio mondo" />);
        expect( await screen.findByText("😐") ).toBeInTheDocument();
    });

    test("Testo personalizzato", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(200, { sentiment: "positive", score: 3, language: "it" });

        render(<Sentiment tweet="Tweet tweet" positive="Sono veramente euforico" />);
        expect( await screen.findByText("Sono veramente euforico") ).toBeInTheDocument();
    });
});

describe("Modalità immagine", function () {
    test("Test immagine corretta - Positive", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(200, { sentiment: "positive", score: 3, language: "it" });

        render(<Sentiment tweet="Tweet tweet" positive="http://src/img1" neutral="http://src/img2" negative="http://src/img3" image />);
        await waitFor( () => {
            const image_element = screen.getByRole("img");
            expect(image_element.src).toEqual("http://src/img1")
        });
    });

    test("Test immagine corretta - Neutral", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(200, { sentiment: "neutral", score: 3, language: "it" });

        render(<Sentiment tweet="Tweet tweet" positive="http://src/img1" neutral="http://src/img2" negative="http://src/img3" image />);
        await waitFor( () => {
            const image_element = screen.getByRole("img");
            expect(image_element.src).toEqual("http://src/img2")
        });
    });

    test("Test immagine corretta - Negative", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(200, { sentiment: "negative", score: 3, language: "it" });

        render(<Sentiment tweet="Tweet tweet" positive="http://src/img1" neutral="http://src/img2" negative="http://src/img3" image />);
        await waitFor( () => {
            const image_element = screen.getByRole("img");
            expect(image_element.src).toEqual("http://src/img3")
        });
    });
});

describe("Test eccezioni", function () {
    test("Tweet mancante", async function () {
        expect( () => render(<Sentiment />) ).toThrow();
    });

    test("Indicate entrambe le modalità", async function () {
        expect( () => render(<Sentiment tweet="tweet tweet" text image />) ).toThrow();
    });

    test("Immagini mancanti", async function () {
        expect( () => render(<Sentiment tweet="tweet tweet" image neutral="a" negative="a" />) ).toThrow();
        expect( () => render(<Sentiment tweet="tweet tweet" image positive="a" negative="a" />) ).toThrow();
        expect( () => render(<Sentiment tweet="tweet tweet" image positive="a" neutral="a" />) ).toThrow();
    });

    test("Errore API", async function () {
        nock("http://localhost")
            .get('/analysis/sentiment').query({ tweet: "Tweet tweet" })
            .reply(500, "Problema interno");

        render(<Sentiment tweet="Tweet tweet" />);
        await new Promise((r) => setTimeout(r, 2000)); // Altrimenti il test passa perché valuta lo stato iniziale (che è vuoto)
        const container_element = screen.getByTestId("span-sentiment");
        expect(container_element).toBeEmptyDOMElement()
    });
});