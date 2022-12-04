const path = require("path");
const { nanoid } = require("nanoid");
const { sendTweet } = require("../tweet/send.js");
const { deleteTweet } = require("../tweet/delete.js");
const { getAllRepliesOf } = require("../fetch/reply.js");
const fs = require("fs").promises;
var ChessImageGenerator = require("chess-image-generator");
const { Chess } = require("chess.js");
const Jimp = require("jimp");


module.exports = class ChessOpponent {
    constructor(color) {
        this.color = color;

        this.curr_tweet_id = null;
        this.current_fen = null;
    }

    async prepareToMove(current_fen) {
        const board_image = await generateBoardImage(current_fen);
        const tweet_data = await sendTweet(
            `Scegli la tua mossa, giochi i ${this.color === "w" ? "bianchi" : "neri"}.\n` +
            `Rispondi a questo tweet con il formato:\n` +
            `[casella di partenza] [casella di arrivo] [promozione (se serve)]\n` +
            `La promozione può essere "queen", "knight", "rook", "bishop"`, [ board_image ]);

        this.curr_tweet_id = tweet_data;
        this.current_fen = current_fen;
    }

    async getMove() {
        // Cancellazione tweet inviato per la mossa
        if (this.curr_tweet_id) {
            await deleteTweet(this.curr_tweet_id);
            this.curr_tweet_id = null;
        }

        // Soluzione temporanea per i test (mossa casuale)
        let move = (new Chess(this.current_fen)).moves({ verbose: true })[0];
        return { from: move.from, to: move.to, promotion: move.flags.includes("p") ? "q" : undefined };
    }
}

async function generateBoardImage(fen) {
    const image_generator = new ChessImageGenerator({
        size: 800,
        style: "cburnett"
    });
    
    await image_generator.loadFEN(fen);

    // Aggiunta padding
    let base_image = await new Jimp(870, 870, "white")
    let board_image = await Jimp.read(await image_generator.generateBuffer());
    board_image = await base_image.composite(board_image, 35, 35);
    
    // Generazione coordinate caselle
    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const letters = [ "a", "b", "c", "d", "e", "f", "g", "h" ] ;   
    for (let i=0; i<8; i++) { board_image = await board_image.print(font, 10, 100*i+65, 8-i); }
    for (let i=0; i<8; i++) { board_image = await board_image.print(font, 840, 100*i+65, 8-i); }
    for (let i=0; i<8; i++) { board_image = await board_image.print(font, 100*i+78, 833, letters[i]); }
    for (let i=0; i<8; i++) { board_image = await board_image.print(font, 100*i+78, 0, letters[i]); }
    
    // await board_image.write(path);
    // await new Promise(r => setTimeout(r, 200));
    return await board_image.getBufferAsync(Jimp.MIME_PNG);
}

// generateBoardImage("rnbqkbnr/pp1ppppp/8/2p5/5P2/8/PPPPP1PP/RNBQKBNR b KQkq f3 0 1", "D:/Uni_dev/tmp/prova.png")
