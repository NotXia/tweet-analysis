const { initTweetStreamSocket } = require("./tweetStream.js")

module.exports = {
    initSocket: initSocket 
}

function initSocket(socketIO) {
    socketIO.on("connection", (socket) => {
        initTweetStreamSocket(socket);
    });
}