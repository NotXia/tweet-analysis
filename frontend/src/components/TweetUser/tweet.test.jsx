import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";

import TweetUser from "./index";


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

        const { container } = render(<TweetUser tweet={tweet} />);
        expect( await screen.findByText("Giggi") ).toBeInTheDocument();
        expect( await screen.findByText("@Luiggi") ).toBeInTheDocument();

        const img_src = [...container.querySelectorAll("img")].map((img) => img.src);
        expect( img_src.includes("https://dominiofittizio.org/percorso/fittizio/file") ).toBeTruthy();
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

        const { container } = render(<TweetUser tweet={tweet} />);
        const img_src = [...container.querySelectorAll("img")].map((img) => img.src);
        expect( img_src.includes("https://dominiofittizio.org/percorso/fittizio/file") ).toBeTruthy();
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image1.png") ).toBeFalsy();
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image2.png") ).toBeFalsy();
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

        const { container } = render(<TweetUser tweet={tweet} />);
        const video_src = [...container.querySelectorAll("video > source")].map((video) => video.src);
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeFalsy();
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeFalsy();
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

        const { container } = render(<TweetUser tweet={tweet} />);
        const img_src = [...container.querySelectorAll("img")].map((img) => img.src);
        const video_src = [...container.querySelectorAll("video > source")].map((video) => video.src);
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image1.png") ).toBeFalsy();
        expect( img_src.includes("https://dominiofittizio.org/percorso/finto/image2.png") ).toBeFalsy();
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeFalsy();
        expect( video_src.includes("https://dominiofittizio.org/percorso/finto/video.mp4") ).toBeFalsy();
    });
});