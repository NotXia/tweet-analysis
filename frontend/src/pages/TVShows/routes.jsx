import TVGame from "./index";
import { getGhigliottinaAttempts, getGhigliottinaWord } from "../../modules/games/ghigliottinaGame";
import { getCatenaFinaleAttempts, getCatenaFinaleWord } from "../../modules/games/catenaFinaleGame";

let routes = [
    {
        path: "/ghigliottina",
        element: <TVGame key="1" title="La Ghigliottina" hashtag="#leredità" getAttemptsFunction={ getGhigliottinaAttempts } getWinningWordFunction={ getGhigliottinaWord } />,
    },
    {
        path: "/catenafinale",
        element: <TVGame key="2" title="Catena Finale" hashtag="#reazioneacatena" getAttemptsFunction={ getCatenaFinaleAttempts } getWinningWordFunction={ getCatenaFinaleWord } />,
    }
]

export default routes;