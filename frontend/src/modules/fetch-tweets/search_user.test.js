import nock from "nock";
process.env.REACT_APP_API_PATH = "http://localhost";

import { userSearchTweet } from "./search_user";


const api_result = {
    tweets: [
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
        {
            id: '0000000000000000000', name: 'Utente generico', username: 'utentegenerico',
            pfp: 'https://pbs.twimg.com/profile_images/1590968738358079488/immagine_generica.jpg',
            text: 'Ciao mondo',
            time: '2022-11-30T15:54:33.000Z', likes: 1, comments: 2, retweets: 3, media: []
        },
    ],
    next_token: 'b26v89c19zqg8o3fpzhm5u53ia2o64fu0wnvgu0w9lugt'
}

describe("Analisi del sentimento", function () {
    test("Richiesta corretta senza opzioni", async function () {
        nock("http://localhost").get("/tweets/user").query({ 
                user: "utentegenerico",
                pag_token: "", 
                quantity: 10, 
                start_time: "", end_time: ""
            })
            .reply(200, api_result);

        const res = await userSearchTweet("utentegenerico");
        expect( res.next_token ).toBeDefined();
        expect( res.tweets.length ).toEqual(10);
    });
});