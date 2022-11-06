import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js"
import { hashtagSearchTweet } from "../../modules/fetch-tweets/search_hashtag.js"
import Tweet from "../../components/Tweet"
import SentimentPie from "../../components/graphs/SentimentPie";
import TweetsTimeChart from "../../components/graphs/TweetsTimeChart";
import WordCloud from "../../components/graphs/WordCloud";

class SearchTweets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            query: "",
            page: "",
            next_page: "",
            quantity: 0,

            fetching: false, // Indica se attualmente si sta richiedendo dei tweet

            error_message: ""
        };

        this.tweets_buffer = [];

        this.input = {
            query: React.createRef(),
            quantity: React.createRef()
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
                        <div className="col-12 order-2 col-md-6 order-md-1 col-lg-4">
                            <div className="list-group border border-white rounded-4">
                                {
                                    this.state.tweets.map((tweet) => (
                                        <Tweet key={tweet.id} tweet={tweet} />
                                    ))
                                }
                                { this.nextPageButton() }
                            </div>
                        </div>

                        <div className="col-12 order-1 col-md-6 order-md-2 col-lg-8">
                            <div className="sticky-top">
                                {/* Barra di ricerca */}
                                <div className="d-flex justify-content-center w-100 p-2 ">
                                    <div className="col-12 col-md-6 col-lg-6 mt-4 border border-grey rounded-4 p-3">
                                        <form className="align-items-start" onSubmit={(e) => { this.searchTweets(e) }}>
                                            <div className="input-group flex-nowrap">
                                                <input ref={this.input.query} className="form-control" id="queryField" type="text" placeholder="Ricerca" aria-label="Username" />
                                                <button className="btn btn-outline-secondary" type="submit" id="button-addon1">Cerca</button>
                                            </div>
                                            <p className="ms-1" style={{ fontSize: "0.9rem" }}>Ricerca per hashtag (#) o nome utente (@)</p>
                                            <hr className="divider col-12 col-md-6 col-lg-4 ms-1" />
                                            <p className="button ms-1 text-muted small" data-bs-toggle="collapse" data-bs-target="#advancedOptions">Clicca qui per visualizzare opzioni avanzate</p>
                                            <div className="collapse" id="advancedOptions">
                                                <div className="d-flex flex-row">
                                                    <div className="col-12 col-md-6 col-lg-4">
                                                        <div className="col-12 col-md-10 col-lg-8">
                                                            <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "0.75rem" }} htmlFor="SearchAmount">Num. ricerche</label>
                                                            <input ref={this.input.quantity} id="SearchAmount" className="form-control" type="number" placeholder="Numero" 
                                                                    defaultValue={10} min={1} max={1000} aria-label="SearchAmount" onChange={(e) => { this.setState({ quantity: e.target.value }) }}/>
                                                        </div>
                                                    </div>
                                                </div>    
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Carica tweet */}
                                <div>
                                    <p className={this.state.tweets.length === 0 ? "d-none":"small text-center m-0 mt-1"} >Attualmente mostrati: {this.state.tweets.length} tweet</p>
                                    <div className="d-flex justify-content-center w-100 p-2">
                                        { this.nextPageButton() }
                                    </div>
                                </div>

                                <div className={`${this.state.tweets.length === 0 ? "d-none" : ""}`}>
                                    <div className="d-flex justify-content-center w-100 p-2">
                                        <div style={{ height: "30vh", width: "100%" }}>
                                            <TweetsTimeChart tweets={this.state.tweets} />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center w-100">
                                        <div style={{ height: "30vh", width: "30%" }}>
                                            <SentimentPie tweets={this.state.tweets} />
                                        </div>
                                        <div className="d-flex justify-content-center" style={{ height: "30vh", width: "70%" }}>
                                            <WordCloud tweets={this.state.tweets} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>);
    }

    async searchTweets(e) {
        e.preventDefault()
        
        try {
            const query = this.input.query.current.value.trim();
            const quantity = parseInt(this.input.quantity.current.value.trim());
            this.tweets_buffer = [];
            let tweets_data = await this.fetchTweets(query, "", quantity);

            this.setState({ 
                tweets: tweets_data.tweets,
                query: query,
                quantity: quantity,
                next_page: tweets_data.next_token,
                error_message:""
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }

    async fetchNextPage(e) {
        e.preventDefault()

        try {
            const query = this.state.query;
            const quantity = parseInt(this.input.quantity.current.value.trim());
            
            if(this.state.next_page==="") {
                return;
            }
            let tweets_data = await this.fetchTweets(query, this.state.next_page, quantity);
    
            this.setState({ 
                tweets: this.state.tweets.concat(tweets_data.tweets),
                page: this.state.next_page,
                next_page: tweets_data.next_token,
                error_message:""
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }

    async fetchTweets(query, next_token="", quantity=10) {
        quantity = parseInt(quantity);

        let fetched_tweets = [];
        let tweets_data = { tweets: [], next_token: "", quantity:undefined};
        
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
                tweets_data = await userSearchTweet(query, next_token, quantity); 
            }
            else if (query[0] === "#") { 
                tweets_data = await hashtagSearchTweet(query, next_token, quantity);
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
