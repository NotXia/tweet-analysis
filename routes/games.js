const express = require("express");
const router = express.Router();

const middlewareGhigliottina = require("../middlewares/ghigliottina.js");
const controllerGhigliottina = require("../controllers/ghigliottina.js");

const middlewareCatenaFinale = require("../middlewares/catenaFinale.js");
const controllerCatenaFinale = require("../controllers/catenaFinale.js");

router.get("/ghigliottina/winning_word", middlewareGhigliottina.ghigliottinaWinningWordValidation, controllerGhigliottina.ghigliottinaWinningWord);
router.get("/ghigliottina", middlewareGhigliottina.gamesGhigliottinaValidation, controllerGhigliottina.gamesGhigliottina);

router.get("/catenaFinale/winning_word", middlewareCatenaFinale.catenaFinaleWinningWordValidation, controllerCatenaFinale.catenaFinaleWinningWord);
router.get("/catenaFinale", middlewareCatenaFinale.gamesCatenaFinaleValidation, controllerCatenaFinale.gamesCatenaFinale);

module.exports = router;