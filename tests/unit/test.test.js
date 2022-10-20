require("dotenv").config();
const app = require("../../index.js");
const session = require('supertest-session');

let curr_session = session(app);

describe("Test raggiungibilità endpoint", function () {
    test("Richiesta GET /test/1", async function () {
        await curr_session.get(`/test/1`).expect(200);
    });
});