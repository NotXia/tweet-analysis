import { io } from "socket.io-client";

export default class ChessGame {
    /**
     * 
     * @param {(player:string, timer:number) => void} onTurnStart                           Richiamato a inizio del turno. player indica il giocatore di quel turno [player, opponent], timer il timeout assegnato
     * @param {(player:string, move:{from:string, to:string, promotion:string}, fen:string) => void} onMove   Richiamato a seguito di una mossa. player indica il giocatore [player, opponent]
     * @param {(state:string, reason:string) => void} onGameOver                            Richiamato a fine partita. state contiene lo stato [win, loss, draw] e reason il motivo
     * @param {(err) => void} onError                                                       Richiamato in caso di errore
     */
    constructor(onTurnStart, onMove, onGameOver, onError) {
        this.socketIO = null;
        this.player_color = null;
        this.current_turn = null;

        this.onTurnStart = onTurnStart;
        this.onMove = onMove;
        this.onGameOver = onGameOver;
        this.onError = onError;
    }
    
    /**
     * Crea una partita di scacchi (non la inizia)
     * @returns {Promise}
     */
    async create() {
        return new Promise((resolve, reject) => {
            this.socketIO = io(`${process.env.REACT_APP_SOCKET_PATH}/games/chess`, { path: `${process.env.REACT_APP_BASE_PATH}socket.io` });
            
            this.socketIO.on("chess.turn.start", (data) => {
                this.current_turn = data.player;
                this.onTurnStart(data.player, data.timer);
            });
            
            this.socketIO.on("chess.move", (data) => {
                this.onMove(data.player, data.move, data.fen);
            });
            
            this.socketIO.on("chess.game_over", (data) => {
                this.onGameOver(data.state, data.reason);
            });

            this.socketIO.on("connect", () => {
                    this.socketIO.emit("chess.init", {}, (res) => {
                    if (res.status === "success") {
                        this.player_color = res.game.player_color;
                        return resolve();
                    }
                    return reject();
                });
            });
        });
    }

    /**
     * Avvia la partita
     * @returns {Promise}
     */
    start() {
        try {
            this.socketIO.emit("chess.start");
        }
        catch (err) {
            this.onError(err);
        }
    }

    /**
     * Esegue una mossa
     * @param {string} from         Casella di partenza
     * @param {string} to           Casella di arrivo
     * @param {string} promotion    Eventuale promozione del pedone
     */
    move(from, to, promotion) {
        try {
            if (this.current_turn === "player") {
                this.socketIO.emit("chess.move", { 
                    move: { from: from, to: to, promotion: promotion } 
                });
            }
        }
        catch (err) {
            this.onError(err);
        }
    }
}