import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
// import { Link } from "react-router-dom";
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js"
import { hashtagSearchTweet } from "../../modules/fetch-tweets/search_hashtag.js"
import Tweet from "../../components/Tweet"

class SearchUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            page: "",

            error_message: ""
        };

        this.input = {
            username: React.createRef()
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
                            <form className="align-items-start" onSubmit={(e) => { this.fetchUserTweets(e) }}>
                                <div className="input-group flex-nowrap">
                                    <input ref={this.input.username} className="form-control" type="text" placeholder="Ricerca" aria-label="Username" />
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon1">Cerca</button>
                                    {/* <input className="input-group-text bg-white" type="submit" /> */}
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
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>);
    }

    async fetchUserTweets(e) {
        e.preventDefault()
        
        try {
            this.setState({ error_message: "" });
            const query = this.input.username.current.value.trim();
            let tweets_data = [];
    
            if (query[0] === "@") { tweets_data = await userSearchTweet(query); }
            else if (query[0] === "#") { tweets_data = await hashtagSearchTweet(query) }
            else { return; }
    
            this.setState({ 
                tweets: tweets_data.tweets,
                page: tweets_data.token
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
        }
    }
}

export default SearchUser;