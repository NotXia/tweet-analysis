const { sendTweet } = require("../tweet/send.js");
const { deleteTweet } = require("../tweet/delete.js");
const { getAllRepliesOf } = require("../fetch/reply.js");
const { generateBoardImage, parseMoveString } = require("./utilities.js");


module.exports = class ChessOpponent {
    constructor(color) {
        this.color = color;

        this.curr_tweet_id = null;
        this.current_fen = null;
    }

    async prepareToMove(current_fen) {
        const board_image = await generateBoardImage(current_fen, this.color === "b");
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