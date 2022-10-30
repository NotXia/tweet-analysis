import '@testing-library/jest-dom';
import { render, screen, waitFor } from "@testing-library/react";

import Tweet from "./index";


describe("Test visualizzazione tweet", function () {
    test("Tweet testuale", async function () {
        const tweet = {
            id: "0000000000000000000",
            name: "Giggi", username: "Luiggi",
            pfp: "https://dominiofittizio.org/percorso/fittizio/file",
            text: "Ciao a tutti #catenaareazione",
            time: "2022-10-30T09:00:00.000Z",
            likes: 5, comments: 6, retweets: 7,
            location: {},
            media: []
        }

        const { container } = render(<Tweet tweet={tweet} />);
        expect( await screen.findByText("Giggi") ).toBeInTheDocument();
        expect( await screen.findByText("@Luiggi") ).toBeInTheDocument();
        expect( await screen.findByText("Ciao a tutti #catenaareazione") ).toBeInTheDocument();

        const img_src = [...container.querySelectorAll("img")].map((img) => img.src);
        expect( img_src.includes("https://dominiofittizio.org/percorso/fittizio/file") ).toBeTruthy();
    });
    
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

        render(<Tweet tweet={tweet} />);
        expect( await screen.findByText("Campodimele - Italy") ).toBeInTheDocument();
    });

    test("Tweet con immagini", async function () {
        const tweet = {
            id: "0000000000000000000",
            name: "Giggi", username: "Luiggi",
            pfp: "https://dominiofittizio.org/percorso/fittizio/file",
            text: "Ciao a tutti #catenaareazione",
            time: "2022-10-30T09:00:00.000Z",
            likes: 5, comments: 6, retweets: 7,
            location: {},
            media: [
                { url: "https://dominiofittizio.org/percorso/finto/image1.png", type: "photo" },
                { url: "https://dominiofittizio.org/percorso/finto/image2.png", type: "photo" }
            ]
        }

        const { container } = render(<Tweet tweet={tweet} />);
        const img_src = [...container.querySelectorAll("img")].map((img) => img.src);
        expect( img_src.includes("https://dominiofittizio.org/percorso/fittizio/file") ).toBeTruthy();
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image1.png") ).toBeTruthy();
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image2.png") ).toBeTruthy();
    });

    test("Tweet con video e gif", async function () {
        const tweet = {
            id: "0000000000000000000",
            name: "Giggi", username: "Luiggi",
            pfp: "https://dominiofittizio.org/percorso/fittizio/file",
            text: "Ciao a tutti #catenaareazione",
            time: "2022-10-30T09:00:00.000Z",
            likes: 5, comments: 6, retweets: 7,
            location: {},
            media: [
                { url: "https://dominiofittizio.org/percorso/finto/video.mp4", type: "video" },
                { url: "https://dominiofittizio.org/percorso/finto/ghif.mp4", type: "animated_gif" }
            ]
        }

        const { container } = render(<Tweet tweet={tweet} />);
        const video_src = [...container.querySelectorAll("video > source")].map((video) => video.src);
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeTruthy();
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeTruthy();
    });

    test("Tweet con immagini e video", async function () {
        const tweet = {
            id: "0000000000000000000",
            name: "Giggi", username: "Luiggi",
            pfp: "https://dominiofittizio.org/percorso/fittizio/file",
            text: "Ciao a tutti #catenaareazione",
            time: "2022-10-30T09:00:00.000Z",
            likes: 5, comments: 6, retweets: 7,
            location: {},
            media: [
                { url: "https://dominiofittizio.org/percorso/finto/image1.png", type: "photo" },
                { url: "https://dominiofittizio.org/percorso/finto/image2.png", type: "photo" },
                { url: "https://dominiofittizio.org/percorso/finto/video.mp4", type: "video" },
                { url: "https://dominiofittizio.org/percorso/finto/ghif.mp4", type: "animated_gif" }
            ]
        }

        const { container } = render(<Tweet tweet={tweet} />);
        const img_src = [...container.querySelectorAll("img")].map((img) => img.src);
        const video_src = [...container.querySelectorAll("video > source")].map((video) => video.src);
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image1.png") ).toBeTruthy();
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image2.png") ).toBeTruthy();
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeTruthy();
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeTruthy();
    });
});