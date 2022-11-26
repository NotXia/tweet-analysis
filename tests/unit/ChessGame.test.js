require("dotenv").config();
const ChessGame = require("../../modules/chess/ChessGame.js");
const InvalidChessMove = require("../../modules/chess/errors/InvalidChessMove.js");


describe("Test gestore partita scacchi", function () {
    test("Creazione partita", function () {
        const chess = new ChessGame();

        expect( chess.game ).toBeDefined();
    });

    test("Movimenti pedina", function () {
        const chess = new ChessGame();

        chess.move("f2", "f3");
        chess.move("c7", "c5");
        try {
            chess.move("e8", "e6");
            expect(true).toBeFalsy();
        }
        catch(err) { expect(err instanceof InvalidChessMove).toBeTruthy(); }
        try {
            chess.move("e1", "e3");
            expect(true).toBeFalsy();
        }
        catch(err) { expect(err instanceof InvalidChessMove).toBeTruthy(); }
    });

    test("Rilevazione turni", function () {
        const chess = new ChessGame();

        expect( chess.getTurn() ).toEqual("w");
        chess.move("f2", "f3");
        expect( chess.getTurn() ).toEqual("b");
        chess.move("c7", "c5");
        expect( chess.getTurn() ).toEqual("w");
        try { chess.move("e1", "e3"); } catch (err) { /* Mossa invalida */ }
        expect( chess.getTurn() ).toEqual("w");
        chess.move("e2", "e3");
        expect( chess.getTurn() ).toEqual("b");
        chess.move("e7", "e5");
    });

    test("Rilevazione scacco matto", function () {
        const chess = new ChessGame();

        chess.game.load("rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3"); // Configurazione con scacco matto per i bianchi
        expect( chess.hasEnded().state ).toEqual("checkmate");
        expect( chess.hasEnded().winner ).toEqual("b");
    });

    test("Rilevazione pareggio", function () {
        let chess = new ChessGame();
        chess.game.load("4k3/4P3/4K3/8/8/8/8/8 b - - 0 78"); // Configurazione in stallo
        expect( chess.hasEnded().state ).toEqual("draw");
        expect( chess.hasEnded().reason ).toEqual("stalemate");

        chess = new ChessGame();
        chess.game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        chess.game.move("Nf3"); chess.game.move("Nf6"); chess.game.move("Ng1"); chess.game.move("Ng8");
        chess.game.move("Nf3"); chess.game.move("Nf6"); chess.game.move("Ng1"); chess.game.move("Ng8"); // Configurazione con 3 ripetizioni dello stesso scenario
        expect( chess.hasEnded().state ).toEqual("draw");
        expect( chess.hasEnded().reason ).toEqual("threefold_repetition");

        chess = new ChessGame();
        chess.game.load("k7/8/n7/8/8/8/8/7K b - - 0 1"); // Configurazione con pedine insufficienti
        expect( chess.hasEnded().state ).toEqual("draw");
        expect( chess.hasEnded().reason ).toEqual("insufficient_material");
    });
});