/*
    Gestisce una scacchiera

    Attributi:
    - width     Dimensione della scacchiera (in pixel)

    Callback
    - onMove(from, to, promotion)   Richiamata quando il giocatore effettua una mossa (valida)

    Metodi:
    - updateFEN(fen)            Per aggiornare il FEN della scacchiera
    - setPlayerColor(color)     Per impostare il colore del giocatore    
*/

import React from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import $ from "jquery";
import { Modal } from "bootstrap";


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fen: undefined,
            player_color: "white"
        };
        
        this.chess_controller = new Chess();
        this.promotion_modal = null;

        this._handlePieceMove = this._handlePieceMove.bind(this);
        this._handleDraggablePiece = this._handleDraggablePiece.bind(this);
    }

    componentDidMount() {
        this.promotion_modal = new Modal(document.querySelector("#modal-promotion"));
    }

    render() {
        return (<>
            <Chessboard boardWidth={this.props.width}
                        position={this.state.fen} 
                        onPieceDrop={this._handlePieceMove} 
                        boardOrientation={this.state.player_color} 
                        isDraggablePiece={this._handleDraggablePiece} />

            {/* Modale per selezioanre la promozione del pedone */}
            <div className="modal fade" id="modal-promotion" tabIndex="-1" aria-labelledby="modal-promotion-label" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="w-100">
                                <h2 className="fs-5 text-center fw-bold" id="modal-promotion-label">Seleziona la promozione</h2>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <button id="button-promotion-queen" className="btn btn-outline-secondary fs-4 p-3" data-bs-dismiss="modal">
                                    <img src={`${process.env.PUBLIC_URL}/icons/chess/queen_${this.state.player_color}.png`} alt="Queen" />
                                </button>
                                <button id="button-promotion-rook" className="btn btn-outline-secondary fs-4 p-3" data-bs-dismiss="modal">
                                    <img src={`${process.env.PUBLIC_URL}/icons/chess/rook_${this.state.player_color}.png`} alt="Rook" />
                                </button>
                                <button id="button-promotion-bishop" className="btn btn-outline-secondary fs-4 p-3" data-bs-dismiss="modal">
                                    <img src={`${process.env.PUBLIC_URL}/icons/chess/bishop_${this.state.player_color}.png`} alt="Bishop" />
                                </button>
                                <button id="button-promotion-knight" className="btn btn-outline-secondary fs-4 p-3" data-bs-dismiss="modal">
                                    <img src={`${process.env.PUBLIC_URL}/icons/chess/knight_${this.state.player_color}.png`} alt="Knight" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    /**
     * Indica se un movimento causa una promozione
     */
    _isPromotion(from, to) {
        const piece = this.chess_controller.get(from);

        return (
            piece.type === "p" && // La pedina è un pedone
            ((piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1")) // È arrivata alla fine
        );
    }

    /**
     * Gestisce e valida il movimento di una pedina
     */
    async _handlePieceMove(from, to) {
        let promotion = undefined;
        if (this._isPromotion(from, to)) { 
            promotion = await this._promptPromotion(); 
        }

        let move = this.chess_controller.move({ from: from, to: to, promotion: promotion });
        if (!move) { return false; } // Mossa invalida

        this.props.onMove(from, to, promotion);
        this.setState({ fen: this.chess_controller.fen() });
        return true;
    }

    /**
     * Visualizza un modale per la selezione della promozione
     * @returns {Promise<string>} Promozione scelta
     */
    async _promptPromotion() {
        this.promotion_modal.show();

        return new Promise((resolve) => {
            $("#button-promotion-queen" ).on("click", () => { resolve("q"); });
            $("#button-promotion-knight").on("click", () => { resolve("n"); });
            $("#button-promotion-bishop").on("click", () => { resolve("b"); });
            $("#button-promotion-rook"  ).on("click", () => { resolve("r"); });
        });
    }

    /**
     * Indica se una pedina è interagibile
     */
    _handleDraggablePiece(data) {
        const color = data.piece[0] === "w" ? "white" : "black";
        return color === this.state.player_color;
    }

    /**
     * Aggiorna il FEN della scacchera
     * @param {string} fen  FEN da caricare
     */
    updateFEN(fen) {
        this.chess_controller.load(fen);
        this.setState({ fen: fen });
    }

    /**
     * Imposta il colore del giocatore
     * @param {string} color    Colore del giocatore
     */
    setPlayerColor(color) {
        this.setState({ player_color: color });
    }
}

export default Board;