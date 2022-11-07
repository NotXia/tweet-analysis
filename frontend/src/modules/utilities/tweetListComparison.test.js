import { sameTweets } from "./tweetListComparison";


describe("Confronto di liste di Tweet", function () {
    test("Liste uguali", async function () {
        let tweets1 = [ { id: 123, text: "A" }, { id: 124, text: "B" }, { id: 125, text: "C" } ]
        let tweets2 = [ { id: 123, text: "A" }, { id: 124, text: "B" }, { id: 125, text: "C" } ]

        expect( sameTweets(tweets1, tweets2) ).toBeTruthy();
    });

    test("Liste diverse 1", async function () {
        let tweets1 = [ { id: 123, text: "A" }, { id: 124, text: "B" }, { id: 126, text: "C" } ]
        let tweets2 = [ { id: 123, text: "A" }, { id: 124, text: "B" }, { id: 125, text: "C" } ]

        expect( sameTweets(tweets1, tweets2) ).toBeFalsy();
    });

    test("Liste diverse 2", async function () {
        let tweets1 = [ { id: 122, text: "A" }, { id: 124, text: "B" }, { id: 125, text: "C" } ]
        let tweets2 = [ { id: 123, text: "A" }, { id: 124, text: "B" }, { id: 125, text: "C" } ]

        expect( sameTweets(tweets1, tweets2) ).toBeFalsy();
    });
});