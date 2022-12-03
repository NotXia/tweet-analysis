/**

    Componente per visualizzare il contenuto di un tweet per i giochi


    Proprietà:
    - tweet:Object      Dati del tweet
    - word:String       Parola tentata nel tweet

*/

import React from "react";
import 'bootstrap';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import TweetUser from "../TweetUser";
import TweetLocation from "../TweetLocation";

class TweetGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    shouldComponentUpdate(next_props, next_state) {
        return this.props.tweet.id !== next_props.tweet.id;                               // Aggiorna se il contenuto del tweet cambia
    }

    render() {
        const tweet = this.props.tweet;
        const word = this.props.word;

        return (<>
            <div className="list-group-item list-group-item-action px-4 pt-4">
                <TweetUser tweet={tweet} />
                
                <p className="m-0 mt-2" style={{fontSize: "1.25rem" }}>{word?.toUpperCase()}</p>
                
                <TweetLocation tweet={tweet} />
            </div>
        </>);
    }
}

export default TweetGame;