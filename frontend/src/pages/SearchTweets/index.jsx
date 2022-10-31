import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js"
import { hashtagSearchTweet } from "../../modules/fetch-tweets/search_hashtag.js"
import Tweet from "../../components/Tweet"

class SearchTweets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            query: "",
            page: "",
            next_page: "",

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
                            <form className="align-items-start" onSubmit={(e) => { this.fetchTweets(e) }}>
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
                                <button className={this.state.next_page===""? "d-none":"btn btn-outline-secondary"} onClick={(e) => { this.fetchNextPage(e) }}>Prossima pagina</button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>);
    }

    async fetchTweets(e) {
        e.preventDefault()
        
        try {
            const query = this.input.query.current.value.trim();
            let tweets_data = [];
    
            if (query[0] === "@") { tweets_data = await userSearchTweet(query); }
            else if (query[0] === "#") { tweets_data = await hashtagSearchTweet(query); }
            else { return; }

            this.setState({ 
                tweets: tweets_data.tweets,
                query: query[0],
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
            const query = this.input.query.current.value;
            let tweets_data = [];      
            
            if(this.state.next_page==="") {
                return;
            }
            else if (this.state.query === "@") { 
                tweets_data = await userSearchTweet(query, this.state.next_page); 
            }
            else if (this.state.query === "#") { 
                tweets_data = await hashtagSearchTweet(query, this.state.next_page);
            }
            else { return; }
    
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
}

export default SearchTweets;