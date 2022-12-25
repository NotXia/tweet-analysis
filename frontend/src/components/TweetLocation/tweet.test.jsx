import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";

import TweetLocation from "./index";


describe("Test visualizzazione tweet", function () {
    test("Tweet con geolocalizzazione", async function () {
        const tweet = {
            id: "0000000000000000000",
            name: "Giggi", username: "Luiggi",
            pfp: "https://dominiofittizio.org/percorso/fittizio/file",
            text: "Ciao a tutti #catenaareazione",
            time: "2022-10-30T09:00:00.000Z",
            likes: 5, comments: 6, retweets: 7,
            location: {
                country: "Italy",
                full_name: "Campodimele",
                id: "111111"
            },
            media: []
        }

        render(<TweetLocation tweet={tweet} />);
        expect( await screen.findByText("Campodimele - Italy") ).toBeInTheDocument();
    });
});