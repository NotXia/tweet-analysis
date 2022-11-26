import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
import ChessGame from "../../modules/games/ChessGame"
import { Chessboard } from "react-chessboard";
import Board from "./components/Board"


class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.board = React.createRef();

        this.onBoardMove = this.onBoardMove.bind(this);

        this.onTurnStart = this.onTurnStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onGameOver = this.onGameOver.bind(this);
        this.onError = this.onError.bind(this);
    }

    render() {
        return (<>
            <Helmet>
                <title>Test</title>
            </Helmet>

            <Navbar />
            
            <h1>Homepage</h1>

            <button onClick={() => {this.init()}}>Init</button>
            <button onClick={() => {this.create()}}>Create</button>
            <button onClick={() => {this.start()}}>Start</button>

            <Board ref={this.board} id="BasicBoard" onMove={this.onBoardMove} />
        </>);
    }

    init() {
        this.game = new ChessGame(this.onTurnStart, this.onMove, this.onGameOver, this.onError);
    }

    async create() {
        await this.game.create();
        this.board.current.setPlayerColor( this.game.player_color === "w" ? "white" : "black" );
    }

    start() {
        this.game.start();
    }

    onBoardMove(from, to) {
        this.game.move(from, to);
    }


    onTurnStart(player, timer) {
        console.log(player, timer)
    }
    
    onMove(player, move, fen) {
        this.setState({ fen: fen });
        console.log(player, move, fen);
        this.board.current.updateFEN(fen);
    } 
    
    onGameOver(state, reason) {
        console.log(state, reason)
    } 
    
    onError(err) {
        console.log(err)
    }
}

export default Test;