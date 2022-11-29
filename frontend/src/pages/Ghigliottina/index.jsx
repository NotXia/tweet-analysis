import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";
import { keywordSearchTweet } from "../../modules/fetch-tweets/search_keyword.js";
import Tweet from "../../components/Tweet";
import GeolocationMap from "../../components/maps/GeolocationMap";
import moment from "moment";

/**
 * A inizializzazione pagina imposta le costanti per la data attuale e la data minima
 */
const today = new Date();
const date = (today.toISOString()).split("T");

const __max_date_limit = date[0];
const __min_date_limit = "2010-11-06";


class SearchTweets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],                             // Array dei tweet 
            date: "",                               // Data da cercare
            fetching: false,                        // Indica se attualmente si sta richiedendo dei tweet

            select_min_date: __min_date_limit,      // Limite minimo attuale della data (a init: "2010-11-06")
            select_max_date: __max_date_limit,      // Limite massimo attuale della data (a init: data di oggi)
            error_message: ""
        };

        this.tweets_buffer = [];
    }

    render() {
        return (<>
            
            <Helmet>
                <title>Ricerca tweet</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-4">
                <div className="container-fluid">
                    
                    <div className="row">
                        <div className="col-12 text-center text-danger fw-semibold">
                            { this.state.error_message }
                        </div>
                    </div>

                    <div className="row my-2">
                        {/* Tweet fetchati */}
                        <div className="col-12 order-3 col-md-6 order-md-1 col-lg-3">
                            <div className="list-group border border-white rounded-4">
                            {
                                this.state.tweets.map((tweet) => (
                                    <Tweet key={tweet.id} tweet={tweet} />
                                ))
                            }
                            </div>
                        </div>

                        <div className="col-12 order-1 col-md-6 order-md-2 col-lg-6">
                            <div className="sticky-top">
                                {/* Barra di ricerca */}
                                <div className="d-flex flex-column justify-content-center align-items-center w-100 p-2">
                                    <h1 className="text-center" style={{ fontSize: "3rem"}}>La Ghigliottina<br /><small className="text-muted">#leredità</small></h1>
                                    <form className="align-items-start">
                                        {/* Data */}
                                        <div>
                                            <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "1.2rem" }} htmlFor="date">Data</label>
                                            <input className="form-control" id="date" type="date" style={{ fontSize: "1.6rem" }}
                                                min={this.state.select_min_date} max={this.state.select_max_date} onChange={(e) => { this.searchTweets(e.target.value) }}/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {/* Mappa geolocalizzazione */}
                        <div className="col-12 order-2 col-md-6 order-md-2 col-lg-3">
                            <div className="sticky-top">
                                <div className={`${this.state.tweets.length === 0 ? "d-none" : ""}`} style={{height: "97vh"}}>
                                    <GeolocationMap tweets={this.state.tweets} cluster={true} connect={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>);
    }

    /**
     * Funzione richiamata al submit del form
     */
    async searchTweets(date) {
    
        try {

            const start_date = date ? moment(date, "YYYY-MM-DD").startOf("day").utc().format() : "";
            let end_date = date ? moment(date, "YYYY-MM-DD").endOf("day").utc().format() : "";
            this.tweets_buffer = [];

            // Se la data supera la data odierna, viene impostata la data odierna (10 secondi sottratti per necessità delle API di Twitter)
            if (end_date && moment(end_date).isAfter(moment())) { end_date = moment().subtract(10, "seconds").utc().format(); } 

            let tweets_data = await this.fetchTweets(start_date, end_date);

            this.setState({ 
                tweets: tweets_data.tweets,
                date: date,
                error_message:""
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }

    /**
     * Ricerca i tweet inerenti alla richiesta
     * @param {string} start_date           Data inizio di ricerca
     * @param {string} end_date             Data finale di ricerca
     * @returns {Promise <object[]>}        Array dei tweet trovati
     */
    async fetchTweets(start_date="", end_date="") {

        let fetched_tweets = [];
        let tweets_data = { 
            tweets: [],
            start_date: "",
            end_date: ""
        };
        
        this.setState({ fetching: true }); // Inizio fetching

        tweets_data = await keywordSearchTweet("#leredita", "", "", start_date, end_date);
        fetched_tweets = fetched_tweets.concat(tweets_data.tweets);

        this.setState({ fetching: false }); // Termine fetching

        tweets_data.tweets = fetched_tweets;
        return tweets_data;
    }
    
}

export default SearchTweets;
