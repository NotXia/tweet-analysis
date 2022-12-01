import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";
import TweetGame from "../../components/TweetGame";
import GeolocationMap from "../../components/maps/GeolocationMap";
import { getGhigliottinaAttempts, getGhigliottinaWord } from "../../modules/games/ghigliottinaGame";
import moment from "moment";

/**
 * A inizializzazione pagina imposta le costanti per la data attuale e la data minima
 */
const today = new Date();
const date = (today.toISOString()).split("T");

const __max_date_limit = date[0];
const __min_date_limit = "2006-03-23";


class SearchTweets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],                             // Array dei tweet 
            date: "",                               // Data da cercare
            winning_word: "",                       // Parola vincente
            fetching: false,                        // Indica se attualmente si sta richiedendo dei tweet

            select_min_date: __min_date_limit,      // Limite minimo attuale della data (a init: "2010-11-06")
            select_max_date: __max_date_limit,      // Limite massimo attuale della data (a init: data di oggi)
            error_message: ""
        };
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
                                    <TweetGame key={tweet.tweet.id} tweet={tweet.tweet} word={tweet.word} />
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

                                {
                                    this.state.winning_word !== "" &&
                                    <div className="d-flex justify-content-center mt-2">
                                        <div className="border rounded fs-3 p-2 px-4">
                                            { this.state.winning_word }
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        {/* Mappa geolocalizzazione */}
                        <div className="col-12 order-2 col-md-6 order-md-2 col-lg-3">
                            <div className="sticky-top">
                                <div className={`${this.state.tweets.length === 0 ? "d-none" : ""}`} style={{height: "97vh"}}>
                                    <GeolocationMap tweets={this.state.tweets.map((tweet) => tweet.tweet)} cluster={true} connect={false} />
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
        date = `${date}T00:00:00Z`;

        try {
            this.setState({ fetching: true }); // Inizio fetching

            let tweets_data = await getGhigliottinaAttempts(date);
            const winning_word = await getGhigliottinaWord(date);

            this.setState({ 
                tweets: tweets_data.tweets,
                date: date,
                winning_word: winning_word.word,
                
                fetching: false,
                error_message:""
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }
    
}

export default SearchTweets;
