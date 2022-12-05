var ChessImageGenerator = require("chess-image-generator");
const { Chess } = require("chess.js");
const Jimp = require("jimp");


module.exports = {
    generateBoardImage: generateBoardImage,
    parseMoveString: parseMoveString,
    normalizePromotionString: normalizePromotionString
}


/**
 * Genera l'immagine della scacchiera in una data configurazione
 * @param {string} fen   FEN della configurazione
 * @returns {Promise<Buffer>} Immagine generata
 */
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