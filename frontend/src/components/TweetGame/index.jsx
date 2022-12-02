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
import moment from "moment";
import he from "he";

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
                <div className="d-flex w-100 justify-content-between">
                    <div className="d-flex align-items-center mb-2">
                        <div className="me-2">
                            <img src={tweet.pfp} alt="" style={{ width: "100%" }} />
                        </div>
                        <div>
                            <p className="m-0">{tweet.name}</p>
                            <p className="m-0 text-muted" style={{fontSize: "0.8rem"}}>@{tweet.username}</p>
                        </div>
                    </div>
                    <p className="small">{moment(tweet.time).format("DD-MM-YYYY HH:mm")}</p>
                </div>
                
                <p className="m-0 mt-2" style={{fontSize: "1.25rem" }}>{word?.toUpperCase()}</p>
                
                <div className={tweet.location ? "" : "d-none"}>
                    <div className="d-flex mt-2">
                        <img className="mt-1 mx-2" src={`${process.env.PUBLIC_URL}/icons/Tweet/earth.png`} alt="" style={{ width:"1.2em", height:"1.2em" }} /> 
                        {
                            (() => {
                                if(tweet.location?.full_name) {
                                    return <p>{tweet.location.full_name} - {
                                        (() => {
                                            if(tweet.location?.country)
                                                return tweet.location.country
                                        })()
                                    }
                                    </p>
                                }
                            })()
                        }
                    </div>
                </div>
            </div>
        </>);
    }
}

export default TweetGame;