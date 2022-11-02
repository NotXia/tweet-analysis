const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/analysis.js");
const controller = require("../controllers/analysis.js");


router.get("/sentiment", middleware.sentimentValidation, controller.sentimentAnalysis);
router.get("/stopwords", middleware.stopwordsRemovalValidation, controller.stopwordsRemoval);


module.exports = router;