const { initTweetStreamSocket } = require("./tweetStream.js")

module.exports = {
    initSocket: initSocket 
}

function initSocket(socketIO) {
    const tweet_stream_ns = socketIO.of("/tweets/stream");

    initTweetStreamSocket(tweet_stream_ns);
}