const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/user");
const controller = require("../controllers/user");

router.get("/user", middleware.tweetsByUserValidation, controller.tweetsByUser);

module.exports = router;