const express = require("express");
const router = express.Router();

const middleware = require("../middlewares/test");
const controller = require("../controllers/test");

router.get("/1", middleware.test, controller.test);

module.exports = router;
