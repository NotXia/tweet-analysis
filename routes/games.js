const express = require("express");
const router = express.Router();

const ghigliottinaMiddleware = require("../middlewares/ghigliottina");
const ghigliottinaController = require("../controllers/ghigliottina");

router.get("/ghigliottina", ghigliottinaMiddleware.gamesGhigliottinaValidation, ghigliottinaController.gamesGhigliottina);

module.exports = router;