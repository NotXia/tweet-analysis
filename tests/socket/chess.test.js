require("dotenv").config();
const server = require("../../index.js");
const clientIO = require("socket.io-client");


let socket_client;

beforeAll(async () => {
    await new Promise((resolve) => { server.listen(60000, () => resolve()); });
    socket_client = new clientIO(`http://localhost:${60000}/games/chess`);
});

afterAll(async () => { 
    await socket_client.disconnect();
    await new Promise((resolve) => { server.close(() => resolve()); });
});


function playAsWhite(turn) {
    switch (turn) {
        case 0:
            socket_client.emit("chess.move", { move: {from: "e2", to: "e4"} });
            break;

        case 2:
            socket_client.emit("chess.move", { move: {from: "d1", to: "h5"} });
            break;
    }
}

function playAsBlack(turn) {
    switch (turn) {
        case 1:
            socket_client.emit("chess.move", { move: {from: "c7", to: "c5"} });
            break;
    
        case 3:
            socket_client.emit("chess.move", { move: {from: "d8", to: "a5"} });
            break;
    }
}


describe("Partita corretta", function () {
    let player_color;

    test("Creazione partita", function (done) {
        socket_client.emit("chess.init", {}, (res) => {
            player_color = res.game.player_color;

            expect(res.status).toEqual("success");
            expect((res.game.player_color === "b") || (res.game.player_color === "w")).toBeTruthy();
            done();
        });
    });

    test("Inizio partita", function (done) {
        socket_client.emit("chess.start", {});
        done();
    });
    
    test("Mosse partita", function (done) {
        let turn = 0;

        socket_client.on("chess.turn.start", async (data) => {
            let curr_turn = turn;
            turn++;

            if (player_color === "w") {
                if (curr_turn === 4) { done(); }

                const current_player = curr_turn % 2 === 0 ? "player" : "opponent";
                expect(data.player).toEqual(current_player);

                if (current_player === "player") { playAsWhite(curr_turn); }
                else { await new Promise(r => setTimeout(r, data.timer + 100)); }
            }
            else {
                if (curr_turn === 5) { done(); }

                const current_player = curr_turn % 2 === 0 ? "opponent" : "player";
                expect(data.player).toEqual(current_player);
                
                if (current_player === "player") { playAsBlack(curr_turn); }
                else { await new Promise(r => setTimeout(r, data.timer + 100)); }
            }
        })
    }, 5000);

    test("Timeout", function (done) {
        socket_client.on("chess.game_over", async (data) => { 
            expect(data.state).toEqual("loss");
            expect(data.reason).toEqual("timeout");
            done();
        });
    }, 10000);
});