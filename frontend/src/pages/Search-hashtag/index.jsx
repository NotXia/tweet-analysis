import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
import { hashtagSearchTweet } from "../../modules/fetch-tweets/search_hashtag.js"
import Tweet from "../../components/Tweet"

class SearchHashtag extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            page: ""
        };

        this.input = {
            hashtag: React.createRef()
        }
    }

    render() {
        return (<>
            <Helmet>
                <title>Ricerca hashtag</title>
            </Helmet>
            
            <Navbar />

            <form className="row align-items-start p-4" method="get">
                <div className="col-4">
                    <div className="input-group flex-nowrap">
                        <span className="input-group-text bg-white" id="addon-wrapping">#</span>
                        <input className="form-control" type="text" placeholder="Inserisci un hashtag" />
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

    async fetchHashtagTweets(e) {
        e.preventDefault()
        const tweets_data = await hashtagSearchTweet(this.input.hashtag.current.value)

        this.setState({ 
            tweets: tweets_data.tweets,
            page: tweets_data.token
        })
    }
}

export default SearchHashtag;