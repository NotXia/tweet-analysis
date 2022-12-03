/**

    Componente per visualizzare l'utente di un tweet


    Proprietà:
    - tweet:Object      Dati del tweet

*/

import React from "react";
import 'bootstrap';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from "moment";

class TweetUser extends React.Component {
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

        return (<>
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

                <div className="d-flex align-items-center h-100">
                    <p className="small">{moment(tweet.time).format("HH:mm")}</p>
                </div>
            </div>
        </>);
    }
}

export default TweetUser;