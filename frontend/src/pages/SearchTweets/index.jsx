import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js"
import { hashtagSearchTweet } from "../../modules/fetch-tweets/search_hashtag.js"
import Tweet from "../../components/Tweet"
import WordCloud from "../../components/graphs/WordCloud";

class SearchTweets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            query: "",
            page: "",
            next_page: "",

            fetching: false, // Indica se attualmente si sta richiedendo dei tweet

            error_message: ""
        };

        this.input = {
            query: React.createRef()
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

                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4">
                            <form className="align-items-start" onSubmit={(e) => { this.searchTweets(e) }}>
                                <div className="input-group flex-nowrap">
                                    <input ref={this.input.query} className="form-control" type="text" placeholder="Ricerca" aria-label="Username" />
                                    <button className="btn btn-outline-secondary" type="submit" id="button-addon1">Cerca</button>
                                </div>
                                <p className="ms-1" style={{ fontSize: "0.9rem" }}>Ricerca per hashtag (#) o nome utente (@)</p>
                            </form>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4 my-2">
                            <div className="list-group ">
                                {
                                    this.state.tweets.map((tweet) => (
                                        <Tweet key={tweet.id} tweet={tweet} />
                                    ))
                                }
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
                                                return <span>Prossima pagina</span>
                                            }
                                        })()
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div style={{height: "30rem", width: "35rem"}}> <WordCloud tweets={this.state.tweets} /> </div>
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
            let tweets_data = await this.fetchTweets(query);

            this.setState({ 
                tweets: tweets_data.tweets,
                query: query,
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
            
            if(this.state.next_page==="") {
                return;
            }
            let tweets_data = await this.fetchTweets(query, this.state.next_page);
    
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

    async fetchTweets(query, next_token="") {
        let tweets_data = { tweets: [], next_token: "" };
        
        this.setState({ fetching: true }); // Inizio fetching

        if (query[0] === "@") { 
            tweets_data = await userSearchTweet(query, next_token); 
        }
        else if (query[0] === "#") { 
            tweets_data = await hashtagSearchTweet(query, next_token);
        }

        this.setState({ fetching: false }); // Termine fetching

        return tweets_data;
    }
}

export default SearchTweets;
