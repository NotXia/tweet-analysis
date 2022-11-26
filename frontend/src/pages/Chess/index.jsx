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
            current_color: "black"
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
            console.log(state, reason)
        } 
        const onError = (err) => {
            console.log(err)
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