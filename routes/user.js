const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/user.js");
const controller = require("../controllers/user.js");

router.get("/user", middleware.tweetsByUserValidation, controller.tweetsByUser);

module.exports = router;