const express = require("express");
const router = express.Router();

const middlewareGames = require("../middlewares/games.js");
const controllerGames = require("../controllers/games.js");

const { ghigliottina, catenaFinale } = require("../modules/games/userAttempts.js");


router.get("/ghigliottina/winning_word", middlewareGames.gamesWinningWordValidation, controllerGames.winningWord("l'eredita", "La #parola della #ghigliottina de #leredita di oggi è:", "quizzettone"));
router.get("/ghigliottina", middlewareGames.gamesValidation, controllerGames.userAttempts(ghigliottina, "l'eredita"));

router.get("/catenafinale/winning_word", middlewareGames.gamesWinningWordValidation, controllerGames.winningWord("reazione a catena", "La #parola della #catena finale per #reazioneacatena di oggi è:", "quizzettone"));
router.get("/catenaFinale", middlewareGames.gamesValidation, controllerGames.userAttempts(catenaFinale, "reazione a catena"));

router.get("/fantacitorio/recap", middlewareGames.fantacitorioRecapValidation, controllerGames.fantacitorioRecap);
router.put("/fantacitorio/recap", middlewareGames.fantacitorioValidateUpdatePoliticianScore , controllerGames.fantacitorioUpdatePoliticianScore);
router.get("/fantacitorio/squads", controllerGames.fantacitorioSquads);
router.get("/fantacitorio/ranking", controllerGames.fantacitorioRanking);
router.get("/fantacitorio/statistics", controllerGames.fantacitorioStatistics);

module.exports = router;