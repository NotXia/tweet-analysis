const express = require("express");
const router = express.Router();

const middlewareGames = require("../middlewares/games.js");
const controllerGames = require("../controllers/games.js");

const { ghigliottina } = require("../modules/games/ghigliottina.js");
const { catenaFinale } = require("../modules/games/catenafinale.js");


router.get("/ghigliottina/winning_word", middlewareGames.gamesWinningWordValidation, controllerGames.winningWord("l'eredita", "La #parola della #ghigliottina de #leredita di oggi è:", "quizzettone"));
router.get("/ghigliottina", middlewareGames.gamesValidation, controllerGames.userAttempts(ghigliottina, "l'eredita"));

router.get("/catenafinale/winning_word", middlewareGames.gamesWinningWordValidation, controllerGames.winningWord("reazione a catena", "La #parola della #catena finale per #reazioneacatena di oggi è:", "quizzettone"));
router.get("/catenaFinale", middlewareGames.gamesValidation, controllerGames.userAttempts(catenaFinale, "reazione a catena"));

module.exports = router;