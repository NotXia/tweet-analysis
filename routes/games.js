const express = require("express");
const router = express.Router();

const middlewareGhigliottina = require("../middlewares/ghigliottina.js");
const controllerGhigliottina = require("../controllers/ghigliottina.js");

router.get("/ghigliottina/winning_word", middlewareGhigliottina.ghigliottinaWinningWordValidation, controllerGhigliottina.ghigliottinaWinningWord);
router.get("/ghigliottina", middlewareGhigliottina.gamesGhigliottinaValidation, controllerGhigliottina.gamesGhigliottina);

module.exports = router;