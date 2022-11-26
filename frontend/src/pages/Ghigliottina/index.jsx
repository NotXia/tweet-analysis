import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";
// import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js";
// import { keywordSearchTweet } from "../../modules/fetch-tweets/search_keyword.js";
// import Tweet from "../../components/Tweet";
// import GeolocationMap from "../../components/maps/GeolocationMap";
// import moment from "moment";
// import { connectToStream } from "../../modules/fetch-tweets/stream"

class Ghigliottina extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],                             // Array dei tweet
            date: "",                               // Data

            fetching: false,                        // Indica se attualmente si sta richiedendo dei tweet

            stream_state: "off",                    // Indica lo stato dello stream di tweet ["off", "loading", "live"]

            // limited_min_date: __min_date_limit,     // Limite minimo imposto per tipo di ricerca
            // select_min_date: __min_date_limit,      // Limite minimo attuale della data (a init: "2010-11-06")
            // select_max_date: __max_date_limit,      // Limite massimo attuale della data (a init: data di oggi)
            error_message: ""
        };

        this.tweets_buffer = [];
        this.stream_socket = null;

        this.input = {          // Dati presi quando si submitta il form
            date: React.createRef()
        };
    }

    render() {
        return(<>
            <Helmet>
                <title>Ghigliottina</title>
            </Helmet>
            
            <Navbar />
        </>);
    }
}

export default Ghigliottina;
