const express = require("express");
const router = express.Router();

const middlewareGhigliottina = require("../middlewares/ghigliottina.js");
const controllerGhigliottina = require("../controllers/ghigliottina.js");

const middlewareCatenaFinale = require("../middlewares/catenafinale.js");
const controllerCatenaFinale = require("../controllers/catenafinale.js");

router.get("/ghigliottina/winning_word", middlewareGhigliottina.ghigliottinaWinningWordValidation, controllerGhigliottina.ghigliottinaWinningWord);
router.get("/ghigliottina", middlewareGhigliottina.gamesGhigliottinaValidation, controllerGhigliottina.gamesGhigliottina);

router.get("/catenafinale/winning_word", middlewareCatenaFinale.catenaFinaleWinningWordValidation, controllerCatenaFinale.catenaFinaleWinningWord);

module.exports = router;