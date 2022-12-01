import TVGame from "./index";
import { getGhigliottinaAttempts, getGhigliottinaWord } from "../../modules/games/ghigliottinaGame";

let routes = [
    {
        path: "/ghigliottina",
        element: <TVGame title="La Ghigliottina" hashtag="#leredità" getAttemptsFunction={ getGhigliottinaAttempts } getWinningWordFunction={ getGhigliottinaWord } />,
    }
]

export default routes;