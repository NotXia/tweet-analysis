const { sendTweet } = require("../tweet/send.js");
const { deleteTweet } = require("../tweet/delete.js");
const { getAllRepliesOf } = require("../fetch/reply.js");
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
        const tweet_id = await sendTweet(
            `Scegli la tua mossa, giochi i ${this.color === "w" ? "bianchi" : "neri"}.\n` +
            `Rispondi a questo tweet con il formato:\n` +
            `[casella di partenza] [casella di arrivo] [promozione (se serve)]\n` +
            `La promozione può essere "queen", "knight", "rook", "bishop"`, [ board_image ]);

        this.curr_tweet_id = tweet_id;
        this.current_fen = current_fen;
    }

    async getMove() {
        if (!this.curr_tweet_id) { return null; }

        // Estrazione risposte degli utenti
        let twitter_replies = [];
        twitter_replies = await getAllRepliesOf(this.curr_tweet_id).catch((err) => { twitter_replies = [] });

        // Cancellazione tweet inviato per raccogliere la mossa
        await deleteTweet(this.curr_tweet_id).catch((err) => { console.error(`Tweet con id ${this.curr_tweet_id} non cancellato`) });
        this.curr_tweet_id = null;

        let has_choose = {}; // Per tenere traccia degli utenti che hanno già scelto la mossa
        let moves_frequency = {};
        for (const reply of twitter_replies) {
            if (has_choose[reply.username]) { continue; } // L'utente ha già scelto
            
            const move = parseMoveString(reply.text, this.current_fen);
            if (!move) { continue; } // Mossa non valida

            // Registrazione mossa
            if (!moves_frequency[JSON.stringify(move)]) { moves_frequency[JSON.stringify(move)] = 0; }
            moves_frequency[JSON.stringify(move)]++;
            has_choose[reply.username] = true;
        }
        
        if (Object.keys(moves_frequency).length === 0) { return null; } // Nessuna mossa valida
        let best_move = Object.keys(moves_frequency).reduce((move1, move2) => moves_frequency[move1] > moves_frequency[move2] ? move1 : move2);
        return JSON.parse(best_move);
    }
}


async function generateBoardImage(fen) {
    const image_generator = new ChessImageGenerator({
        size: 800,
        style: "cburnett"
    });
    
    await image_generator.loadFEN(fen);

    // Aggiunta padding
    let base_image = new Jimp(870, 870, "white");
    let board_image = await Jimp.read(await image_generator.generateBuffer());
    board_image = base_image.composite(board_image, 35, 35);
    
    // Generazione coordinate caselle
    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const letters = [ "a", "b", "c", "d", "e", "f", "g", "h" ] ;   
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 10, 100*i+65, 8-i); }
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 840, 100*i+65, 8-i); }
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 100*i+78, 833, letters[i]); }
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 100*i+78, 0, letters[i]); }
    
    return await board_image.getBufferAsync(Jimp.MIME_PNG);
}


/**
 * Valida e converte una stringa che rappresenta una mossa in un oggetto
 * @param {*} move_string   Stringa della mossa
 * @param {*} current_fen   Stato attuale della scacchiera
 * @returns {{from:string, to:string, promotion:string}|null} La mossa se valida, null altrimenti
 */
function parseMoveString(move_string, current_fen) {
    move_string = move_string.trim().replace(/\s\s+/g, " ").toLowerCase(); // Normalizza rimuovendo spazi in eccesso

    const parts = move_string.split(" ");
    const board = new Chess(current_fen);

    // Composizione mossa della stringa
    let move = { from: parts[0], to: parts[1] }
    if (parts.length >= 3) { move.promotion = normalizePromotionString(parts[2]); }

    if (!board.move(move)) { return null; }
    return move;
}

/**
 * Normalizza una stringa contenente una promozione
 * @param {string} promotion  Stringa della promozione
 * @returns {string} La promozione in un formato normalizzato
 */
function normalizePromotionString(promotion) {
    promotion = promotion.toLowerCase();

    switch(promotion) {
        case "q":
        case "queen":   return "q";
        case "n":
        case "knight":  return "n";
        case "b":
        case "bishop":  return "b";
        case "r":
        case "rook":    return "r";
        default:        return "";
    }
}