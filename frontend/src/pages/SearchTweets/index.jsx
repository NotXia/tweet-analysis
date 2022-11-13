import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js";
import { keywordSearchTweet } from "../../modules/fetch-tweets/search_keyword.js";
import Tweet from "../../components/Tweet";
import SentimentPie from "../../components/graphs/SentimentPie";
import TweetsTimeChart from "../../components/graphs/TweetsTimeChart";
import WordCloud from "../../components/graphs/WordCloud";
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
            query: "",                              // Ricerca          
            next_page: "",                          // Chiave alla prossima pagina di ricerca
            quantity: 0,                            // Numero di ricerche da effettuare
            start_date: "",                         // Data di inizio da dove cercare
            end_date: "",                           // Data di fine

            fetching: false,                        // Indica se attualmente si sta richiedendo dei tweet

            date_week_limited: false,
            limited_min_date: __min_date_limit,     // Limite minimo imposto per tipo di ricerca
            select_min_date: __min_date_limit,      // Limite minimo attuale della data (a init: "2010-11-06")
            select_max_date: __max_date_limit,      // Limite massimo attuale della data (a init: data di oggi)
            error_message: ""
        };

        this.tweets_buffer = [];

        this.input = {          // Dati presi quando si submitta il form
            query: React.createRef(),
            quantity: React.createRef(),
            start_date: React.createRef(),
            end_date: React.createRef()
        }
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
                            { this.state.error_message}
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
                            { this.nextPageButton() }
                            </div>
                        </div>

                        <div className="col-12 order-1 col-md-6 order-md-2 col-lg-6">
                            <div className="sticky-top">
                                {/* Barra di ricerca */}
                                <div className="d-flex justify-content-center w-100 p-2">
                                    <div className="col-12 col-md-10 col-lg-8 mt-4 border border-grey rounded-4 p-3">
                                        <form className="align-items-start" onSubmit={(e) => { this.searchTweets(e) }}>
                                            {/* Barra primaria - Query */}
                                            <div className="input-group flex">
                                                <input ref={this.input.query} className="form-control" id="queryField" type="text" placeholder="Ricerca" aria-label="Username"
                                                        onChange={ (e) => this.dateRangeModifier(e) } required />
                                                <button className="btn btn-outline-secondary" type="submit" id="button-addon1">Cerca</button>
                                            </div>
                                            <p className="ms-1" style={{ fontSize: "0.80rem", color: "grey" }}>Ricerca per parola chiave, hashtag (#) o nome utente (@)</p>
                                            <hr className="divider col-12 col-md-6 col-lg-4 ms-1" />
                                            {/* Opzioni avanzate */}
                                            <p className="button m-0 ms-1 mb-2 small text-decoration-underline" data-bs-toggle="collapse" data-bs-target="#advancedOptions">Clicca qui per visualizzare opzioni avanzate</p>
                                            <div className="collapse" id="advancedOptions">
                                                <div className="row justify-content-between align-items-center">
                                                    {/* Numero di ricerche */}
                                                    <div className="col-12 col-lg-4">
                                                        <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "0.75rem" }} htmlFor="SearchAmount">Num. ricerche</label>
                                                        <input ref={this.input.quantity} id="SearchAmount" className="form-control" type="number" placeholder="Numero" style={{ fontSize: "0.80rem" }}
                                                                defaultValue={10} min={1} max={1000} aria-label="SearchAmount" onChange={(e) => { this.setState({ quantity: e.target.value }) }}/>
                                                    </div>
                                                    {/* Data di inizio */}
                                                    <div className="col-12 col-lg-4">
                                                        <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "0.75rem" }} htmlFor="start_date">Data di inizio</label>
                                                            <input ref={this.input.start_date} className="form-control" id="start_date" type="date" style={{ fontSize: "0.80rem" }}
                                                                min={this.state.limited_min_date} max={this.state.select_max_date} onChange={(e) => { this.setState({ select_min_date: (e.target.value!==""? e.target.value : this.state.limited_min_date) })}}/>
                                                    </div>
                                                    {/* Data di fine */}
                                                    <div className="col-12 col-lg-4">
                                                        <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "0.75rem" }} htmlFor="end_date">Data di fine</label>
                                                        <input ref={this.input.end_date} className="form-control" id="end_date" type="date" style={{ fontSize: "0.80rem" }}
                                                                min={this.state.select_min_date} max={__max_date_limit} onChange={(e) => { this.setState({ select_max_date: (e.target.value!==""? e.target.value : __max_date_limit) }) }}/>
                                                    </div>
                                                </div>
                                                <p className="small text-muted m-0 ms-1 mt-2" style={{ fontSize: "0.7rem" }}>Cambiando il numero di ricerche cambia il numero di tweet fetchati per la prossima pagina</p>    
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Bottone Prossima pagina */}
                                <div>
                                    <p className={this.state.tweets.length === 0 ? "d-none":"small text-center m-0 mt-1"} ><mark>Attualmente mostrati: <strong>{this.state.tweets.length}</strong> tweet</mark></p>
                                    <div className="d-flex justify-content-center w-100 p-2">
                                        { this.nextPageButton() }
                                    </div>
                                </div>
                                
                                {/* Grafici */}
                                <div className={`${this.state.tweets.length === 0 ? "d-none" : "mt-3 p-2 border border-light rounded-4"}`}>
                                    <div className="d-flex justify-content-center w-100 p-2">
                                        <div className="px-2" style={{ height: "30vh", width: "100%" }}>
                                            <TweetsTimeChart tweets={this.state.tweets} />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center w-100">
                                        <div className="px-2" style={{ height: "30vh", width: "30%" }}>
                                            <SentimentPie tweets={this.state.tweets} />
                                        </div>
                                        <div className="px-2" style={{ height: "30vh", width: "50%" }}>
                                            <WordCloud tweets={this.state.tweets} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 order-2 col-md-6 order-md-2 col-lg-3">
                            <div className="sticky-top">
                                <div className={`${this.state.tweets.length === 0 ? "d-none" : ""}`} style={{height: "97vh"}}>
                                    <GeolocationMap tweets={this.state.tweets}></GeolocationMap>
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
    async searchTweets(e) {
        e.preventDefault();
    
        try {
            const query = this.input.query.current.value.trim();
            const quantity = parseInt(this.input.quantity.current.value.trim());
            const start_date = this.input.start_date.current.value ? moment(this.input.start_date.current.value, "YYYY-MM-DD").startOf("day").utc().format() : "";
            let end_date = this.input.end_date.current.value ? moment(this.input.end_date.current.value, "YYYY-MM-DD").endOf("day").utc().format() : "";
            this.tweets_buffer = [];

            // Se la data di fine supera la data odierna, viene impostata la data odierna (10 secondi sottratti per necessità delle API di Twitter)
            if (end_date && moment(end_date).isAfter(moment())) { end_date = moment().subtract(10, "seconds").utc().format(); } 

            let tweets_data = await this.fetchTweets(query, "", quantity, start_date, end_date);

            this.setState({ 
                tweets: tweets_data.tweets,
                query: query,
                quantity: quantity,
                next_page: tweets_data.next_token,
                start_date: start_date,
                end_date: end_date,
                error_message:""
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }

    /**
     * Richiede la prossima pagina della ricerca
     */
    async fetchNextPage(e) {
        e.preventDefault()

        try {
            const query = this.state.query;
            const quantity = parseInt(this.input.quantity.current.value.trim());
            const start_date = this.state.start_date;
            const end_date = this.state.end_date;
            
            if(this.state.next_page==="") {
                return;
            }
            let tweets_data = await this.fetchTweets(query, this.state.next_page, quantity, start_date, end_date);
    
            this.setState({ 
                tweets: this.state.tweets.concat(tweets_data.tweets),
                next_page: tweets_data.next_token,
                error_message:""
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }

    /**
     * Ricerca i tweet inerenti alla richiesta
     * @param {string} query                Username o hashtag della ricerca
     * @param {string} next_token           Token da dove iniziare la ricerca (default "")
     * @param {number} quantity             Numero di tweet da ricercare (default 10)
     * @param {string} start_date           Data inizio di ricerca
     * @param {string} end_date             Data finale di ricerca
     * @returns {Promise <object[]>}        Array dei tweet trovati
     */
    async fetchTweets(query, next_token="", quantity=10, start_date="", end_date="") {
        quantity = parseInt(quantity);

        let fetched_tweets = [];
        let tweets_data = { 
            tweets: [],
            next_token: "",
            quantity:undefined,
            start_date: "",
            end_date: ""
        };
        
        this.setState({ fetching: true }); // Inizio fetching

        // Estrae dal buffer eventuali tweet salvati
        if (this.tweets_buffer.length > 0) {
            fetched_tweets = this.tweets_buffer.slice(0, quantity);     // Estrae dal buffer
            this.tweets_buffer = this.tweets_buffer.slice(quantity);    // Aggiorna buffer
            quantity -= fetched_tweets.length;                          // Aggiorna quantità mancante
        }

        // Se il buffer non soddisfa la richiesta
        if (quantity > 0) {
            if (query[0] === "@") { 
                tweets_data = await userSearchTweet(query, next_token, quantity, start_date, end_date); 
            }
            else if (query !== "") { 
                tweets_data = await keywordSearchTweet(query, next_token, quantity, start_date, end_date);
            }

            if (tweets_data.tweets.length > quantity) { // Salva nel buffer i tweet in eccesso
                this.tweets_buffer = this.tweets_buffer.concat(tweets_data.tweets.slice(-(tweets_data.tweets.length-quantity)))
                
                // Rimuove i tweet in eccesso
                fetched_tweets = fetched_tweets.concat(tweets_data.tweets.slice(0, quantity));
            }
            else { // I tweet sono nella quantità esatta
                fetched_tweets = tweets_data.tweets;
            }
        }
        else {
            tweets_data.next_token = next_token; // Mantiene il token salvato se la richiesta è totalmente soddisfatta dal buffer
        }

        this.setState({ fetching: false }); // Termine fetching

        tweets_data.tweets = fetched_tweets;
        return tweets_data;
    }
    
    /**
     * Modifica il limite della selezione per la data minima a seconda del tipo di ricerca
     * Se la tipologia della query attuale è "#" oppure parola chiave, saranno selezionabili solo oggi e i 7 giorni prima di oggi
     * Altrimenti viene reimpostato il limite normale (2010-11-06)
     */
    dateRangeModifier(e) {
        e.preventDefault();
        const query = this.input.query.current.value;
        let aweekago = new Date();

        if ((query[0] !== "@" && query !== "") && this.state.date_week_limited === false) {
            
            aweekago.setDate(aweekago.getDate()-7);
            const newLimit = ((aweekago.toISOString()).split("T"))[0];
            this.setState({
                date_week_limited: true,
                limited_min_date: newLimit,
                select_min_date: newLimit,
                select_max_date: __max_date_limit
            });
        }
        else if((query[0] === "@" || query === "") && this.state.date_week_limited === true) {
            this.setState({
                date_week_limited: false,
                limited_min_date: __min_date_limit,
                select_min_date: __min_date_limit
            });
        }
    }


    nextPageButton() {
        return (
            <button className={this.state.next_page===""? "d-none":"btn btn-outline-secondary"} onClick={(e) => { this.fetchNextPage(e) }} disabled={this.state.fetching}>
            {
                (() => {
                    if (this.state.fetching) {
                        return (
                            <span>
                                Caricamento
                                <span className="spinner-grow spinner-grow-sm ms-2" role="status" aria-hidden="true"></span>
                            </span>
                        )
                    }
                    else {
                        return <span>Prossima pagina ({this.state.quantity})</span>
                    }
                })()
            }
            </button>
        )
    }
}

export default SearchTweets;
