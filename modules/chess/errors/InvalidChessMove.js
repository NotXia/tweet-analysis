class InvalidChessMove extends Error {
    /**
     * Eccezione per segnalare una mossa invalida
     */
    constructor(message="Mossa invalida") {
        super(message);
        this.name = "InvalidChessMove";
    }
}

module.exports = InvalidChessMove;