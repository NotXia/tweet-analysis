const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/keyword");
const controller = require("../controllers/keyword");

router.get("/keyword", middleware.tweetsByKeywordValidation, controller.tweetsByKeyword);

module.exports = router;
