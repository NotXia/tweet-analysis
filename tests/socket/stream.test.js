require("dotenv").config();
const server = require("../../index.js");
const clientIO = require("socket.io-client");
const nock = require("nock");
const { generateTweets } = require("../utils/tweet.js");


let socket_client;

beforeAll(async () => {
    await new Promise((resolve) => { server.listen(60000, () => resolve()); });
    socket_client = new clientIO(`http://localhost:${60000}/tweets/stream`);
});

afterAll(async () => { 
    await socket_client.disconnect();
    await new Promise((resolve) => { server.close(() => resolve()); });
});


const stream_params = {
    "expansions": "geo.place_id,author_id,attachments.media_keys",
    "tweet.fields": "created_at,text,public_metrics",
    "place.fields": "country,full_name,geo",
    "media.fields": "url,variants",
    "user.fields": "name,profile_image_url,username"
}           


describe("Connessione e ricezione da stream per keyword", function () {
    nock("https://api.twitter.com").persist()
        .get("/2/tweets/search/stream").query(stream_params)
        .reply(200, async () => {
            let tweet = generateTweets(1);
            tweet.data = tweet.data[0];
            tweet.matching_rules = [ { id: "1165037377523306498" } ]
            return tweet;
        });

    test("Inizializzazione connessione e creazione regola", function (done) {
        nock("https://api.twitter.com")
            .post("/2/tweets/search/stream/rules", { add: [{ value: `#hashtag -is:retweet -is:reply` }] })
            .reply(200, {
                data: [ { "id": "1165037377523306498", "value": "#hashtag -is:retweet -is:reply" } ],
                meta: { "sent": "2019-08-29T01:12:10.729Z" }
            });

        socket_client.emit("tweet.stream.init", { keyword: "#hashtag" }, (res) => {
            expect(res.status).toEqual("success");
            done();
        });
    });

    test("Ricezione tweet", function (done) {
        socket_client.on("tweet.stream.new", (tweet) => {
            expect( tweet.id ).toBeDefined();
            done();
        });
    });
});