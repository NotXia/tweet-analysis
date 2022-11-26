import React from "react";
import { Helmet } from 'react-helmet'
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/Navbar"
import ChessGame from "../../modules/games/ChessGame"
import Board from "./components/Board"


class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            game_ready: false
        };

        this.board = React.createRef();

        this.onBoardMove = this.onBoardMove.bind(this);
    }

    render() {
        return (<>
            <Helmet>
                <title>Test</title>
            </Helmet>

            <Navbar />
            
            <h1>Scacchi con Twitter</h1>

            <div className={`${this.state.game_ready ? "d-none" : ""} d-flex align-items-center justify-content-center`}>
                <button className="btn btn-outline-success btn-lg" onClick={() => this.stateGame()}>Inizia una partita</button>
            </div>

            <div className={`${this.state.game_ready ? "" : "d-none"} d-flex justify-content-center`}>
                <Board ref={this.board} id="BasicBoard" onMove={this.onBoardMove} />
            </div>
        </>);
    }

    async stateGame() {
        const onTurnStart = (player, timer) => {
            console.log(player, timer)
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