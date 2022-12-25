const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/fetch");
const controller = require("../controllers/keyword");

router.get("/keyword", middleware.fetchTweets("keyword", "Parola chiave mancante"), controller.tweetsByKeyword);

module.exports = router;
