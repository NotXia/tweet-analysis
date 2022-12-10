import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";
import TweetGame from "../../components/TweetGame";
import TweetUser from "../../components/TweetUser";
import GeolocationMap from "../../components/maps/GeolocationMap";
import moment from "moment";
import { getWinners, getMostWinningFrom } from "../../modules/games/tvgameWinners";

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

            most_winning: [],

            select_min_date: __min_date_limit,      // Limite minimo attuale della data (a init: "2010-11-06")
            select_max_date: __max_date_limit,      // Limite massimo attuale della data (a init: data di oggi)
            error_message: ""
        };
    }

    render() {
        return (<>
            
            <Helmet>
                <title>{ this.props.title }</title>
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
                                    <h1 className="text-center" style={{ fontSize: "3rem"}}>{ this.props.title }<br /><small className="text-muted">{ this.props.hashtag }</small></h1>
                                    <form className="align-items-start">
                                        {/* Data */}
                                        <div>
                                            <div className="d-flex align-items-end justify-content-center">
                                                <div className={`mb-2 me-2 ${this.state.fetching ? "" : "d-none"}`}>
                                                    <div className="spinner-grow" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "1.2rem" }} htmlFor="date">Data</label>
                                                    <input className="form-control" id="date" type="date" style={{ fontSize: "1.6rem" }}
                                                        min={this.state.select_min_date} max={this.state.select_max_date} onChange={(e) => { this.searchTweets(e.target.value) }}
                                                        disabled={this.state.fetching || this.state.fetching_most_winning} />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Parola del giorno */}
                                {
                                    this.state.winning_word !== "" &&
                                    <div>
                                        <p className="fs-5 fw-bold text-center mb-0 mt-2">Parola di oggi</p>
                                        <div className="d-flex justify-content-center">
                                            <div className="border rounded fs-3 p-2 px-4">
                                                { this.state.winning_word }
                                            </div>
                                        </div>
                                    </div>
                                }

                                <div className="container-fluid mt-2">
                                    <div className="row">
                                        {/* Vincitori di oggi */}
                                        <div className="col-12 col-md-6">
                                            {
                                                this.state.date !== "" &&
                                                <div>
                                                    <p className="fs-5 fw-bold text-center mb-0">Vincitori di oggi</p>
                                                    <div className="overflow-auto border rounded border-opacity-100" style={{ height: "50vh" }}>
                                                    {
                                                        (() => {
                                                            if (this.state.winning_word === "") { return <div className="fs-5 d-flex justify-content-center align-items-center text-center h-100 w-100">Non è ancora stata annunciata la parola vincente</div>; }

                                                            const winners = getWinners(this.state.tweets, this.state.winning_word);

                                                            if (winners.length === 0) { return <div className="fs-5 d-flex justify-content-center align-items-center text-center h-100 w-100">Nessuno ha indovinato la parola di oggi</div>; }
                                                            else {
                                                                return (
                                                                    <ul className="list-group list-group-flush">
                                                                    {
                                                                        winners.map((tweet) => (
                                                                            <li key={`winner-tweet-${tweet.id}`} className="list-group-item border-opacity-50 border-bottom">
                                                                                <TweetUser tweet={tweet} />
                                                                            </li>
                                                                        ))
                                                                    }
                                                                    </ul>
                                                                )
                                                            }
                                                        })()
                                                    }
                                                    </div>
                                                </div>
                                            }
                                        </div>

                                        {/* Vincitori di sempre */}
                                        <div className="col-12 col-md-6">
                                            {
                                                (this.state.most_winning && this.state.date !== "") &&
                                                <div>
                                                    <div className="d-flex align-items-center justify-content-center w-100 fs-5 fw-bold text-center mb-0">
                                                        I più vincenti - 
                                                        Ultimi 
                                                        <select className="mx-1 form-select w-auto" defaultValue={7} disabled={this.state.fetching_most_winning}
                                                                onChange={(e) => { this.fetchMostWinning(this.state.date, parseInt(e.target.value)-1) }}>
                                                            <option value={7}>7</option>
                                                            <option value={14}>14</option>
                                                            <option value={30}>30</option>
                                                        </select>
                                                        giorni
                                                    </div>

                                                    <div className="overflow-auto border rounded border-opacity-100" style={{ height: "50vh" }}>
                                                    {
                                                        (() => {
                                                            if (this.state.fetching_most_winning) { return <div className="fs-5 d-flex justify-content-center align-items-center text-center h-100 w-100"><span className={`spinner-grow`} role="status" /></div>; }
                                                            if (this.state.most_winning.length === 0) { return <div className="fs-5 d-flex justify-content-center align-items-center text-center h-100 w-100">Nessuno ha indovinato ultimamente</div>; }

                                                            return (
                                                                <ul className="list-group list-group-flush">
                                                                {
                                                                    this.state.most_winning.map((winner_data) => (
                                                                        <li key={`winner-tweet-${winner_data.tweet.id}`} className="list-group-item border-opacity-50 border-bottom">
                                                                            <div className="d-flex align-items-center justify-content-center">
                                                                                <TweetUser tweet={winner_data.tweet} time_format="" />
                                                                                <span className="me-2 fw-semibold fs-5">{winner_data.times}</span>
                                                                            </div>
                                                                        </li>
                                                                    ))
                                                                }
                                                                </ul>
                                                            )
                                                        })()
                                                    }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

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
        if (date === "") { return this.setState({ error_message: "", tweets: [], date: "", winning_word: "" }); }

        date = `${date}T00:00:00Z`;

        // Inizio fetching
        this.setState({ 
            fetching: true, error_message: "",
            tweets: [],
            date: "",
            winning_word: "",
            most_winning: []
        });

        // Ricerca tentativi
        try {
            let tweets_data = await this.props.getAttemptsFunction(date);
            tweets_data = tweets_data.tweets;
            tweets_data.sort((t1, t2) => moment(t2.tweet.time).diff(moment(t1.tweet.time)));

            this.setState({ 
                tweets: tweets_data,
                date: date
            });
        }
        catch (err) {
            console.log(err)
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }

        // Ricerca parola vincente
        try {
            const winning_word = await this.props.getWinningWordFunction(date, 7);

            this.setState({ 
                winning_word: winning_word.word,
            });
        }
        catch (err) {
            if (err.response.status !== 404) { 
                this.setState({ error_message: "Si è verificato un errore durante la ricerca della parola vincente" });
            }
        }

        // Ricerca più vincenti
        this.fetchMostWinning(date, );

        this.setState({ fetching: false });
    }

    async fetchMostWinning(start_date, number_of_days=7) {
        this.setState({ 
            most_winning: [],
            fetching_most_winning: true 
        });

        const most_winning = await getMostWinningFrom(start_date, moment(start_date).subtract(number_of_days, "days"), this.props.getAttemptsFunction, this.props.getWinningWordFunction);

        this.setState({ 
            most_winning: most_winning, 
            winning_range: number_of_days,
            fetching_most_winning: false 
        });
    }
}

export default SearchTweets;
