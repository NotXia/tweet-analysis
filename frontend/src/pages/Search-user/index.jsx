import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
// import { Link } from "react-router-dom";
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js"
import Tweet from "../../components/Tweet"

class SearchUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            page: ""
        };

        this.input = {
            username: React.createRef()
        }
    }

    render() {
        return (<>
            <Helmet>
                <title>Ricerca utente</title>
            </Helmet>
            
            <Navbar />

            <form className="row align-items-start p-4" onSubmit={(e) => { this.fetchUserTweets(e) }}>
                <div className="col-4">
                    <div className="input-group flex-nowrap">
                        <span className="input-group-text bg-white" id="addon-wrapping">@</span>
                        <input ref={this.input.username} className="form-control" type="text" placeholder="Inserisci un nome utente" aria-label="Username" />
                        <input className="input-group-text bg-white" type="submit"/>
                    </div>
                </div>
            </form>

            <div className="list-group col-4 ms-4 my-2">
                {
                    this.state.tweets.map((tweet) => (
                        <Tweet key={tweet.id} tweet={tweet} />
                    ))
                }
            </div>

            
        </>);
    }

    async fetchUserTweets(e) {
        e.preventDefault()
        console.log(this.input.username.current.value)
        const tweets_data = await userSearchTweet(this.input.username.current.value)


        this.setState({ 
            tweets: tweets_data.tweets,
            page: tweets_data.token
        })
        console.log(tweets_data)
    }
}

export default SearchUser;