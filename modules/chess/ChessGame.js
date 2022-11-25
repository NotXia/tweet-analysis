const { Chess } = require("chess.js");


function _generateId() { return `${(new Date()).getTime()}_${Math.random().toString(16).slice(2)}`; }

module.exports = class ChessGame {
    constructor() {
        this.id = _generateId();
        this.game = new Chess();
    }

    /**
     * Esegue una mossa sulla scacchiera (se valida)
     * @param {string} from     Casella di partenza (es. f2)
     * @param {string} to       Casella di arrivo (es. f3)
     * @returns {boolean} true se la mossa è valida, false altrimenti
     */
    move(from, to) {
        let result = this.game.move({from: from, to: to});
    
        return result != null;
    }

    /**
     * Indica se la partita è terminata
     * @returns {{state:string, winner:string}|{state:string, reason:string}|null} Lo stato della partita se terminata [checkmate, draw], null altrimenti
     * - Se state = checkmate, il campo winner indica il vincitore [w, b]
     * - Se state = draw, il campo reason indica il motivo [stalemate, threefold_repetition, insufficient_material, 50_move]
     */
    hasEnded() {
        if (!this.game.isGameOver()) return null;

        if (this.game.isCheckmate()) {
            return {
                state: "checkmate",
                winner: this.game.turn() === "w" ? "b" : "w" // Lo scacco matto è avvenuto al turno precedente
            };
        }
        else if (this.game.isStalemate())               { return { state: "draw", reason: "stalemate" }; }
        else if (this.game.isThreefoldRepetition())     { return { state: "draw", reason: "threefold_repetition" }; }
        else if (this.game.isInsufficientMaterial())    { return { state: "draw", reason: "insufficient_material" }; }
        else if (this.game.isDraw())                    { return { state: "draw", reason: "50_move" }; }

        throw new Error("Stato indefinito");
    }
}