const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/fetch");
const controller = require("../controllers/user");

router.get("/user", middleware.fetchTweets("user", "Nome utente mancante"), controller.tweetsByUser);

module.exports = router;