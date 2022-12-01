const controller = require("../controllers/chess.js");


module.exports = {
    initChessSocket: init
}


function init(socket_namespace) {
    controller.init(socket_namespace);

    socket_namespace.on("connection", (socket) => {
        try {
            socket.on("chess.init", (data, response) => {
                controller.onGameCreate(socket, data, response);
            });

            socket.on("chess.start", (data, response) => {
                controller.onGameStart(socket, data, response);
            });

            socket.on("chess.move", (data, response) => {
                if (!data || (!data?.move?.from && !data?.move?.to)) { 
                    return response({ status: "error", error: "Parametri mancanti" }); 
                }

                controller.onPlayerMove(socket, data, response);
            });
        }
        catch (err) {
            console.error(err)
        }
    });
}