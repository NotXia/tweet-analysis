/**

    Componente per visualizzare il contenuto di un tweet


    Proprietà:
    - tweet:Object      Dati del tweet

*/

import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";
import moment from "moment";

class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const tweet = this.props.tweet;

        return (<>
            <Link to="" className="list-group-item list-group-item-action p-4" aria-current="true">
                <div className="d-flex w-100 justify-content-between">
                    <div className="d-flex align-items-center mb-2">
                        <div className="me-2">
                            <img src={tweet.pfp} alt="" style={{ width: "100%" }} />
                        </div>
                        <div>
                            <p className="fs-5 m-0">{tweet.name}</p>
                            <p className="m-0" style={{fontSize: "0.8rem"}}>@{tweet.username}</p>
                        </div>
                    </div>
                    <p>{moment(tweet.time).format("DD-MM-YYYY HH:MM:ss")}</p>
                </div>
                <p className="m-0">{tweet.text}</p>
            </Link>
        </>);
    }
}

export default Tweet;