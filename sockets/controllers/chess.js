require("dotenv").config();
const ChessGame = require("../../modules/chess/ChessGame.js");
const InvalidChessMove = require("../../modules/chess/errors/InvalidChessMove.js");
const ChessOpponent = require("../../modules/chess/ChessOpponent");
const { sendTweet } = require("../../modules/tweet/send.js");
const { generateBoardImage, expandGameOverReason } = require("../../modules/chess/utilities.js");


const TIMER_TOLLERANCE =    process.env.NODE_ENV.includes("testing") ? 0    : 500;
const PLAYER_TIMEOUT =      process.env.NODE_ENV.includes("testing") ? 1000 : 15000;
const OPPONENT_DELAY =      process.env.NODE_ENV.includes("testing") ? 100  : 20000;
const OPPONENT_SYNC_DELAY = process.env.NODE_ENV.includes("testing") ? 0    : 10000;
const NEW_GAME_TIMEOUT =    process.env.NODE_ENV.includes("testing") ? 1000 : 60000;

module.exports = {
    init: init,
    onGameCreate: onGameCreate,
    onGameStart: onGameStart,
    onPlayerMove: onPlayerMove
}


let socketIO_namespace = null;
function init(namespace) { socketIO_namespace = namespace; }


class GameSession {
    constructor(socket) {
        this.socket = socket;
        this.socket_id = socket.id;

        this.controller = new ChessGame();
        this.player_color = (["w", "b"])[Math.floor(Math.random()*2)]; // Selezione colore giocatore
        this.opponent = new ChessOpponent(this.player_color === "w" ? "b" : "w");

        this.curr_tweet_id = null;

        this.player_move_timeout = null;
    }

    /**
     * Indica chi deve giocare al turno attuale
     * @returns {"player"|"opponent"} Il giocatore che deve fare la mossa
     */
    getTurn() {
        return (this.controller.getTurn() === this.player_color) ? "player" : "opponent";
    }


    /**
     * Gestisce il turno del giocatore.
     * Avvia un timeout dopo il quale il giocatore perde se non fa nessuna mossa
     */
    handlePlayerTurn() {
        this.socket.emit("chess.turn.start", { player: "player", timer: PLAYER_TIMEOUT });

        // Attende la mossa del giocatore
        this.player_move_timeout = setTimeout(() => {
            // Partita terminata per timeout del giocatore
            this.endGame();
            this.socket.emit("chess.game_over", { state: "loss", reason: "timeout" });
            this.sendGameOverTweet("loss", "timeout");
        }, PLAYER_TIMEOUT + TIMER_TOLLERANCE);
    }

    /**
     * Gestisce la mossa del giocatore
     * @param {{from:string, to:string}} move   La mossa fatta
     */
    handlePlayerMove(move) {
        clearTimeout(this.player_move_timeout); // Annulla il timeout del giocatore

        this.controller.move(move.from, move.to, move.promotion);
        this.socket.emit("chess.move", { player: "player", move: move, fen: this.controller.getFEN() }); // Acknowledge della mossa
    }


    /**
     * Gestisce il turno dell'avversario.
     */
    async handleOpponentTurn() {
        this.socket.emit("chess.turn.start", { player: "opponent", timer: OPPONENT_DELAY+OPPONENT_SYNC_DELAY });

        if (!process.env.NODE_ENV.includes("testing")) {
            await this.opponent.prepareToMove(this.controller.getFEN());
        }

        // Delay prima di scegliere la mossa dell'avversario
        setTimeout(async () => {
            try {
                await new Promise(r => setTimeout(r, OPPONENT_SYNC_DELAY)); // Attende che le Twitter sia allineato con le risposte
                let move = null;
                
                if (!process.env.NODE_ENV.includes("testing")) {
                    // Estrae la mossa da Twitter
                    move = await this.opponent.getMove();
                }

                // Seleziona una mossa casuale se nessuna è stata scelta
                if (!move) {
                    const possible_moves = this.controller.game.moves({ verbose: true });
                    const random_move = possible_moves[Math.floor(Math.random()*possible_moves.length)];
                    move = { from: random_move.from, to: random_move.to, promotion: random_move.flags.includes("p") ? "q" : undefined }
                }

                this.handleOpponentMove(move);
                if (this.controller.hasEnded()) { return this.handleGameOver(); }
                this.handlePlayerTurn();
            }
            catch (err) {
                if (err instanceof InvalidChessMove) {
                    this.endGame();
                    this.socket.emit("chess.game_over", { state: "win", reason: "invalid_move" });
                    this.sendGameOverTweet("win", "invalid_move");
                }
            }
        }, OPPONENT_DELAY + TIMER_TOLLERANCE);
    }
    
    /**
     * Gestisce la mossa dell'avversario
     * @param {{from:string, to:string}} move   La mossa fatta
     */
    handleOpponentMove(move) {
        this.controller.move(move.from, move.to, move.promotion);
        this.socket.emit("chess.move", { player: "opponent", move: move, fen: this.controller.getFEN() }); // Acknowledge della mossa
    }


    /**
     * Gestisce la terminazione di una partita a seguito di una condizione di vittoria/sconfitta
     */
    handleGameOver() {
        const result = this.controller.hasEnded();
    
        if (!result) { return; } // La partita non è realmente terminata
    
        this.endGame();
        if (result.state === "checkmate") {
            this.socket.emit("chess.game_over", { 
                state: result.winner === this.player_color ? "win" : "loss", 
                reason: "checkmate" 
            });
            this.sendGameOverTweet(result.winner === this.player_color ? "win" : "loss", "checkmate");
        }
        else if (result.state === "draw") {
            this.socket.emit("chess.game_over", { state: "draw", reason: result.reason });
            this.sendGameOverTweet(state, result.reason);
        }
        else {
            this.socket.emit("chess.game_over", { state: "undefined" });
        }
    }

    /**
     * Gestisce l'invio di un tweet con l'esito della partita
     * @param {string} state    Stato della partita rispetto al giocatore
     * @param {string} reason   Motivo game over
     */
    async sendGameOverTweet(state, reason) {
        let expanded_state = "";
        let expanded_reason = expandGameOverReason(reason);

        switch (state) {
            case "win":  expanded_state = "Sconfitta"; break;
            case "draw": expanded_state = "Pareggio"; break;
            case "loss": expanded_state = "Vittoria"; break;
        }

        const tweet_content = expanded_reason ? `${expanded_state} per ${expanded_reason}` : `${expanded_state}`;
        const board_image = await generateBoardImage(this.controller.getFEN(), this.player_color === "w");
        await sendTweet(`${expanded_state} per ${expanded_reason}`, [ board_image ]);
    }

    /**
     * Termina una partita
     */
    endGame() {
        delete socketid_to_game[this.socket_id];
    
        clearTimeout(this.player_move_timeout);
    }
}


let socketid_to_game = {};          // Mappa socket id alla partita
let socketid_to_gametimeout = {};   // Mappa socket id al timeout della partita

/* Gestisce la creazione di una partita */
async function onGameCreate(socket, data, response) {
    try {
        // Creazione partita
        let game = new GameSession(socket);
        socketid_to_game[socket.id] = game;

        socketid_to_gametimeout[socket.id] = setTimeout(async () => { game.endGame(); }, NEW_GAME_TIMEOUT); // Elimina la partita dopo un timeout di inattività

        return response({ 
            status: "success", 
            game: { 
                player_color: game.player_color
            } 
        });
    }
    catch (err) {
        return response({ status: "error", error: "Si è verificato un errore" });
    }
}

/* Gestisce l'avvio di una partita */
async function onGameStart(socket, data, response) {
    try {
        // Annulla il timeout per partita inattiva
        clearTimeout(socketid_to_gametimeout[socket.id]);
        delete socketid_to_gametimeout[socket.id];

        let game = socketid_to_game[socket.id];

        if (game.getTurn() === "player") { 
            game.handlePlayerTurn(socket); 
        }
        else { 
            game.handleOpponentTurn(socket); 
        }
    }
    catch (err) {
        return response({ status: "error", error: "Si è verificato un errore" });
    }
}

/* Gestisce la mossa del giocatore */
function onPlayerMove(socket, data, response) {
    try {
        let game = socketid_to_game[socket.id];
        if (!game) { return; }

        const move = data.move;

        // Mossa fatta fuori dal proprio turno
        if (game.getTurn() !== "player") { return response({ status: "error", error: "Non è il tuo turno" }); }

        try {
            game.handlePlayerMove(move);
            if (game.controller.hasEnded()) { return game.handleGameOver(); }
            game.handleOpponentTurn();
        }
        catch (err) {
            if (err instanceof InvalidChessMove) {
                game.endGame();
                return socket.emit("chess.game_over", { state: "loss", reason: "invalid_move" });
                this.sendGameOverTweet("loss", "invalid_move");
            }

            throw err;
        }
    }
    catch (err) {
        return response({ status: "error", error: "Si è verificato un errore" });
    }
}