import React from "react";
import { Helmet } from 'react-helmet'
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/Navbar";
import ChessGame from "../../modules/games/ChessGame";
import Board from "./components/Board";
import Timer from "./components/Timer";
import { Chess } from "chess.js";


class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            game_ready: false,
            board_width: (Math.min(window.innerHeight, window.innerWidth)) * 0.75,
            current_color: "",
            player_color: "",
            opponent_color: "",

            end_state: null,
            end_description: null,

            error_message: null
        };

        this.board = React.createRef();
        this.timer = React.createRef();

        this.onBoardMove = this.onBoardMove.bind(this);
    }

    componentDidMount() {
        window.onresize = (e) => {
            this.setState({ board_width: (Math.min(window.innerHeight, window.innerWidth)) * 0.75 })
        };
    }

    render() {
        return (<>
            <Helmet>
                <title>Scacchi</title>
            </Helmet>

            <div style={{ display: "flex", flexFlow: "column", height: "100vh" }}>
                <div style={{ flex: "0 1 auto" }}>
                    <Navbar />
                </div>
                
                <main style={{ flex: "1 1 auto" }}>
                    <div className="col-12 text-center text-danger fw-semibold"> { this.state.error_message } </div>

                    <div className="d-flex justify-content-center align-items-center h-100">
                        {/* Schermata iniziale */}
                        <div className={`${this.state.game_ready ? "d-none" : ""} text-center`}>
                            <h1 className="mb-1">Scacchi contro Twitter</h1>
                            <p className="text-muted mb-4">Gioca una partita in cui gli utenti di Twitter scelgono a maggioranza la mossa dell'avversario</p>
                            <button className="btn btn-outline-success btn-lg" onClick={() => this.startGame()}>Inizia una partita</button>
                        </div>

                        {/* Partita */}
                        <div className={`${this.state.game_ready ? "" : "d-none"} w-100`}>
                            <div className="container-fluid">
                                <div className="row">
                                    {/* Scacchiera */}
                                    <div className="col-12 col-md-8 col-lg-6">
                                        <div className={`d-flex justify-content-center justify-content-md-end`} style={{ pointerEvents: this.state.end_state ? "none" : "auto" }}>
                                            <Board ref={this.board} onMove={this.onBoardMove} width={this.state.board_width} />
                                        </div>
                                    </div>

                                    {/* Informazioni di gioco */}
                                    <div className="col-12 col-md-4 col-lg-6">
                                        {/* Timer */}
                                        <div className="d-flex justify-content-evenly">
                                            <div className={`${this.state.current_color === "white" ? "" : "invisible"}`}>
                                                <img src={`${process.env.PUBLIC_URL}/icons/chess/king_white.png`} alt="Turno bianchi" />
                                            </div>
                                            <Timer ref={this.timer} />
                                            <div className={`${this.state.current_color === "black" ? "" : "invisible"}`}>
                                                <img src={`${process.env.PUBLIC_URL}/icons/chess/king_black.png`} alt="Turno neri" />
                                            </div>
                                        </div>

                                        <div className={`text-center ${this.state.end_state ? "d-none" : ""}`}>
                                            <p className={`${this.state.current_color === this.state.player_color ? "" : "d-none"} fs-5`}>È il tuo turno</p>
                                            <p className={`${this.state.current_color === this.state.player_color ? "d-none" : ""} fs-5`}>È il turno degli utenti di Twitter</p>
                                        </div>

                                        {/* Esito */}
                                        {
                                            this.state.end_state &&
                                            (<>
                                                <p className="m-0 fs-1 text-center fw-bold">{ this.state.end_state }</p>
                                                <p className="fs-2 text-center">{ this.state.end_description }</p>
                                                <div className="d-flex justify-content-center">
                                                    <button className="btn btn-outline-success" onClick={() => this.startGame()}>Gioco di nuovo</button>
                                                </div>
                                            </>)
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </>);
    }

    async startGame() {
        const onTurnStart = (player, timer) => {
            this.setState({ current_color: player === "player" ? this.state.player_color : this.state.opponent_color });
            this.timer.current.setTime(timer);
        }
        const onMove = (player, move, fen) => {
            this.setState({ fen: fen });
            this.board.current.updateFEN(fen);
        } 
        const onGameOver = (state, reason) => {
            switch (state) {
                case "win":  this.setState({ end_state: "Vittoria" }); break;
                case "loss": this.setState({ end_state: "Sconfitta" }); break;
                case "draw": this.setState({ end_state: "Pareggio" }); break;
                default: break;
            }

            switch (reason) {
                case "checkmate":               this.setState({ end_description: "Scacco matto" }); break;
                case "stalemate":               this.setState({ end_description: "Stallo" }); break;
                case "threefold_repetition":    this.setState({ end_description: "Ripetizione" }); break;
                case "insufficient_material":   this.setState({ end_description: "Pedine insufficienti" }); break;
                case "50_move":                 this.setState({ end_description: "Regola delle cinquanta mosse" }); break;
                case "timeout":                 this.setState({ end_description: "Tempo scaduto" }); break;
                case "invalid_move":            this.setState({ end_description: "Mossa invalida" }); break;
                default: break;
            }

            this.timer.current.setTime(0);
        } 
        const onError = (err) => {
            this.setState({ error_message: "Si è verificato un errore" });
        }

        this.game = new ChessGame(onTurnStart, onMove, onGameOver, onError);

        // Creazione partita
        await this.game.create();
        const player_color = this.game.player_color === "w" ? "white" : "black";
        const opponent_color = this.game.player_color === "w" ? "black" : "white";
        this.board.current.setPlayerColor( player_color );
        this.board.current.updateFEN((new Chess()).fen());

        // Avvio partita
        this.setState({ 
            game_ready: true, 
            player_color: player_color, opponent_color: opponent_color,
            end_state: null, end_description: null
        }, () => {
            this.game.start();
        });
    }

    /**
     * Gestisce la mossa del giocatore
     */
    onBoardMove(from, to, promotion) {
        this.game.move(from, to, promotion);
    }
}

export default Test;