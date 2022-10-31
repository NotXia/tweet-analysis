const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/analysis");
const controller = require("../controllers/analysis");


router.get("/sentiment", middleware.sentimentValidation, controller.sentimentAnalysis);
router.get("/stopwords", middleware.stopwordsRemovalValidation, controller.stopwordsRemoval);


module.exports = router;