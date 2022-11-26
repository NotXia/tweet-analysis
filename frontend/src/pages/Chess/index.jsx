import React from "react";
import { Helmet } from 'react-helmet'
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/Navbar"
import ChessGame from "../../modules/games/ChessGame"
import Board from "./components/Board"
import Timer from "./components/Timer"


class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            game_ready: false,
            board_width: (Math.min(window.innerHeight, window.innerWidth)) * 0.75,
            current_color: "black",

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
                        <div className={`${this.state.game_ready ? "d-none" : ""}`}>
                            <button className="btn btn-outline-success btn-lg" onClick={() => this.stateGame()}>Inizia una partita</button>
                        </div>

                        {/* Partita */}
                        <div className={`${this.state.game_ready ? "" : "d-none"} w-100`}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex justify-content-center justify-content-md-end">
                                            <Board ref={this.board} id="BasicBoard" onMove={this.onBoardMove} width={this.state.board_width} />
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <div className="d-flex justify-content-evenly">
                                            <div className={`${this.state.current_color === "white" ? "" : "invisible"}`}>
                                                <img src={`${process.env.PUBLIC_URL}/icons/chess/king_white.png`} alt="Turno bianchi" />
                                            </div>
                                            <Timer ref={this.timer} />
                                            <div className={`${this.state.current_color === "black" ? "" : "invisible"}`}>
                                                <img src={`${process.env.PUBLIC_URL}/icons/chess/king_black.png`} alt="Turno neri" />
                                            </div>
                                        </div>

                                        <p className="m-0 fs-1 text-center fw-bold">{ this.state.end_state }</p>
                                        <p className="fs-2 text-center">{ this.state.end_description }</p>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </>);
    }

    async stateGame() {
        const onTurnStart = (player, timer) => {
            this.setState({ current_color: this.state.current_color === "white" ? "black" : "white"  });
            this.timer.current.setTime(timer);
        }
        const onMove = (player, move, fen) => {
            this.setState({ fen: fen });
            console.log(player, move, fen);
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
        this.board.current.setPlayerColor( this.game.player_color === "w" ? "white" : "black" );

        // Avvio partita
        this.setState({ game_ready: true }, () => {
            this.game.start();
        });
    }

    onBoardMove(from, to, promotion) {
        this.game.move(from, to, promotion);
    }
}

export default Test;