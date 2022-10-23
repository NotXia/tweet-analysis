const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/sentiment");
const controller = require("../controllers/sentiment");


router.get("/sentiment", middleware.sentimentValidation, controller.sentimentAnalysis);


module.exports = router;