const { initTweetStreamSocket } = require("./routes/tweetStream.js")
const { initChessSocket } = require("./routes/chess.js")

module.exports = {
    initSocket: initSocket 
}

function initSocket(socketIO) {
    const tweet_stream_ns = socketIO.of("/tweets/stream");
    const chess_ns = socketIO.of("/games/chess");

    initTweetStreamSocket(tweet_stream_ns);
    initChessSocket(chess_ns);
}