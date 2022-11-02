const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/hashtag");
const controller = require("../controllers/hashtag");

router.get("/hashtag", middleware.tweetsByHashtagValidation, controller.tweetsByHashtag);

module.exports = router;
