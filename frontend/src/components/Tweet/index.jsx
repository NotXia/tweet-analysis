/**

    Componente per visualizzare il contenuto di un tweet


    Proprietà:
    - tweet:Object      Dati del tweet

*/

import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from "moment";
import Sentiment from "../Sentiment"
import he from "he"

class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const tweet = this.props.tweet;

        return (<>
            {/* <a href={"https://twitter.com/twitter/status/" + tweet.id} target="_blank" rel="noreferrer" className="list-group-item list-group-item-action px-4 pt-4" aria-current="true"> */}
            <div className="list-group-item list-group-item-action px-4 pt-4">
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
                <p className="m-0 mt-3">{he.decode(tweet.text)}</p>
                <div id={`media-carousel-${tweet.id}`} className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {
                            tweet.media.map((media, index) => {
                                let active = index === 0? "active" : ""
                                return (
                                    <div key={media.url} className={`carousel-item ${active}`}>
                                        {
                                            (() => {
                                                switch(media.type) {
                                                    case "photo":
                                                        return <img src={media.url} alt="" style={{width: "100%"}} />                               
                                                    case "video":
                                                        return <video style={{width: "100%"}} controls><source src={media.url} type="video/mp4"/></video>
                                                    case "animated_gif":
                                                        return <video style={{width: "100%"}} autoPlay loop muted><source src={media.url} type="video/mp4"/></video>
                                                    default:
                                                        return null
                                                }
                                            })()
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className={tweet.media.length>1 ? "" : "d-none"}>
                        <button className="carousel-control-prev" type="button" data-bs-target={`#media-carousel-${tweet.id}`} data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target={`#media-carousel-${tweet.id}`} data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                <div className="d-flex w-100 justify-content-between mt-4">
                    <div className="d-flex mt-2">
                        <img className="mt-1 mx-2" src="./icons/Tweet/comment.png" alt="" style={{ width:"1.2em", height:"1.2em" }} />
                        <p className="me-2">{tweet.comments}</p>
                    </div>
                    <div className="d-flex mt-2">
                        <img className="mt-1 mx-2" src="./icons/Tweet/retweet.png" alt="" style={{ width:"1.2em", height:"1.2em" }} /> 
                        <p className="me-2">{tweet.retweets}</p>
                    </div>
                    <div className="d-flex mt-2">
                        <img className="mt-1 mx-2" src="./icons/Tweet/like.png" alt="" style={{ width:"1.2em", height:"1.2em" }} /> 
                        <p className="me-2">{tweet.likes}</p> 
                    </div>
                </div>
                <div className={tweet.location ? "" : "d-none"}>
                    <div className="d-flex mt-2">
                        <img className="mt-1 mx-2" src="./icons/Tweet/earth.png" alt="" style={{ width:"1.2em", height:"1.2em" }} /> 
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
                <Sentiment tweet={tweet.text} />
            {/* </a> */}
            </div>
        </>);
    }
}

export default Tweet;