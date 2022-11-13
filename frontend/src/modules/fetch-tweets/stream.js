import { io } from "socket.io-client";


/**
 * Gestisce al connessione allo stream di tweet live e ascolta con un determinato filtro
 * @param {Object} filter                        Filtro da applicare
 * @param {string} filter.username               Username da filtrare
 * @param {string} filter.keyword                Parola chiave o hashtag da filtrare
 * @param {(tweet:Object)=>void} onTweet        Funzione richiamata all'arrivo di un nuovo tweet
 * @param {()=>void} onConnect                  Funzione richiamata dopo una connessione con successo
 * @param {()=>void} onDisconnect               Funzione chiamata alla disconnessione
 * @param {()=>void} onError                    Funzione richiamata in caso di errore
 * @returns {Object} Socket della connessione
 */
export function connectToStream(filter, onTweet, onConnect=()=>{}, onDisconnect=()=>{}, onError=()=>{}) {
    if (!filter || (!filter.username && !filter.keyword)) { throw new Error("Parametri di ricerca mancanti"); }
    if (!onTweet) { throw new Error("Non è stata indicata nessuna operazione da eseguire all'arrivo dei tweet"); }
    
    const socketIO = io(`${process.env.REACT_APP_API_PATH}/tweets/stream`);

    socketIO.on("connect", async () => {
        socketIO.emit("tweet.stream.init", filter, (res) => {
            if (res.status === "success") {
                return onConnect();
            }
            return onError();
        });
    })

    socketIO.on("tweet.stream.new", (data) => {
        onTweet(data);
    })

    socketIO.on("disconnect", () => {
        onDisconnect();
    });

    return socketIO;
}