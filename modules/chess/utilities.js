const ChessImageGenerator = require("chess-image-generator");
const { Chess } = require("chess.js");
const Jimp = require("jimp");


module.exports = {
    generateBoardImage: generateBoardImage,
    parseMoveString: parseMoveString,
    normalizePromotionString: normalizePromotionString,
    expandGameOverReason: expandGameOverReason
}


/**
 * Genera l'immagine della scacchiera in una data configurazione
 * @param {string} fen      FEN della configurazione
 * @param {boolean} flip    Se si vuole invertire la scacchiera (POV dei neri)
 * @returns {Promise<Buffer>} Immagine generata
 */
async function generateBoardImage(fen, flip=false) {
    const image_generator = new ChessImageGenerator({
        size: 800,
        style: "cburnett"
    });
    
    await image_generator.loadFEN(fen);

    // Genera la scacchiera con le pedine posizionate
    let board_image = await Jimp.read(await image_generator.generateBuffer());
    
    // Per le coordinate
    let board_x_axis = [ "a", "b", "c", "d", "e", "f", "g", "h" ]; // Sinistra a destra
    let board_y_axis = [ "8", "7", "6", "5", "4", "3", "2", "1" ]; // Alto al basso

    // Gestione scacchiera invertita
    if (flip) {
        board_x_axis.reverse();
        board_y_axis.reverse();

        // Inverte le pedine
        for (let i=0; i<8; i++) {
            for (let j=0; j<8; j++) {
                let x_coord = 100*i, y_coord = 100*j;
                let piece = await Jimp.read(board_image);
                piece.crop(x_coord, y_coord, 100, 100).flip(false, true);
                piece.flip(true, false);
                board_image = board_image.composite(piece, x_coord, y_coord);
            }
        }
        // Inverte la scacchiera
        board_image = board_image.rotate(180);
    }
    
    // Aggiunta padding
    let base_image = new Jimp(870, 870, "white");
    board_image = base_image.composite(board_image, 35, 35);

    // Generazione coordinate caselle
    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 10, 100*i+65, board_y_axis[i]); }
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 840, 100*i+65, board_y_axis[i]); }
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 100*i+78, 833, board_x_axis[i]); }
    for (let i=0; i<8; i++) { board_image = board_image.print(font, 100*i+78, 0, board_x_axis[i]); }

    return board_image.getBufferAsync(Jimp.MIME_PNG);
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
    promotion = promotion.replace(/\s/g, "").toLowerCase();

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

function expandGameOverReason(reason) {
    switch (reason) {
        case "checkmate":               return "Scacco matto";
        case "stalemate":               return "Stallo";
        case "threefold_repetition":    return "Tre ripetizioni";
        case "insufficient_material":   return "Materiale insufficiente";
        case "50_move":                 return "Cinquanta mosse catture";
        case "invalid_move":            return "Mossa invalida";
        case "timeout":                 return "Tempo scaduto";
        default: return "";
    }
}