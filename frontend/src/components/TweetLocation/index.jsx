/**

    Componente per visualizzare la posizione di un tweet


    Proprietà:
    - tweet:Object      Dati del tweet

*/

import React from "react";
import 'bootstrap';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

class TweetLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    shouldComponentUpdate(next_props, next_state) {
        return this.props.tweet.id !== next_props.tweet.id; // Aggiorna se il contenuto del tweet cambia
    }

    render() {
        const tweet = this.props.tweet;

        return (<>
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
        </>);
    }
}

export default TweetLocation;