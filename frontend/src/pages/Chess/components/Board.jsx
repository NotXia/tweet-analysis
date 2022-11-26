import React from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fen: undefined,
            player_color: "white"
        };
        
        this.chess_controller = new Chess();

        this.handlePieceMove = this.handlePieceMove.bind(this);
    }

    render() {
        return (<>
            <Chessboard position={this.state.fen} onPieceDrop={this.handlePieceMove} boardOrientation={this.state.player_color} />
        </>);
    }

    isPromotion(from, to) {
        const piece = this.chess_controller.get(from);

        return (
            piece.type === "p" && // La pedina è un pedone
            ((piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1")) // È arrivata alla fine
        );
    }

    handlePieceMove(from, to) {
        let promotion = undefined
        if (this.isPromotion(from, to)) { promotion = "q"; }

        let move = this.chess_controller.move({ from: from, to: to, promotion: promotion });
        console.log(move, { from: from, to: to, promotion: promotion })
        if (!move) { return false; }

        this.props.onMove(from, to);
        this.setState({ fen: this.chess_controller.fen() });
        return true;
    }

    updateFEN(fen) {
        this.chess_controller.load(fen);
        this.setState({ fen: fen });
    }

    setPlayerColor(color) {
        this.setState({ player_color: color });
    }
}

export default Board;