const express = require("express");
const router = express.Router();

const middlewareGames = require("../middlewares/games.js");

const controllerGhigliottina = require("../controllers/ghigliottina.js");
const controllerCatenaFinale = require("../controllers/catenafinale.js");

router.get("/ghigliottina/winning_word", middlewareGames.gamesWinningWordValidation, controllerGhigliottina.ghigliottinaWinningWord);
router.get("/ghigliottina", middlewareGames.gamesValidation, controllerGhigliottina.gamesGhigliottina);

router.get("/catenafinale/winning_word", middlewareGames.gamesWinningWordValidation, controllerCatenaFinale.catenaFinaleWinningWord);
router.get("/catenaFinale", middlewareGames.gamesValidation, controllerCatenaFinale.gamesCatenaFinale);

module.exports = router;