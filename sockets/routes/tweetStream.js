const controller = require("../controllers/tweetStream.js");


module.exports = {
    initTweetStreamSocket: init
}


function init(socket_namespace) {
    controller.init(socket_namespace);

    socket_namespace.on("connection", (socket) => {
        try {
            /**
             * Inizializzazione della connessione per ricevere tweet in tempo reale
             * 
             * Formato richiesta
             * {
             *      username:string     Username da cui ricevere
             *      keyword:string      Keyword da cui ricevere
             * }
             */
            socket.on("tweet.stream.init", (data, response) => {
                if (!data || (!data.username && !data.keyword)) { 
                    return response({ status: "error", error: "Parametri mancanti" }); 
                }

                controller.onClientInit(socket, data, response);
            });
    
            socket.on("disconnect", () => {
                controller.onClientDisconnect(socket)
            });
        }
        catch (err) {
            console.error(err)
        }
    });
}