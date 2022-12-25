/**

    Componente per visualizzare il contenuto di un tweet


    Proprietà:
    - tweet:Object      Dati del tweet

*/

import React from "react";
import $ from "jquery"
import 'bootstrap';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sentiment from "../Sentiment"
import he from "he"
import css from "./tweet.module.css"
import TweetUser from "../TweetUser";
import TweetLocation from "../TweetLocation";

class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            carousel_media_index: 0
        };

        this.carousel_id = `media-carousel-${this.props.tweet.id}`;
    }

    shouldComponentUpdate(next_props, next_state) {
        return this.props.tweet.id !== next_props.tweet.id ||                               // Aggiorna se il contenuto del tweet cambia
               this.state.carousel_media_index !== next_state.carousel_media_index;         // Aggiorna se cambia l'indice del carousel
    }

    componentDidMount() {
        // Richiamato quando si cambia slide del carousel
        document.querySelector(`#${this.carousel_id}`).addEventListener("slid.bs.carousel", (e) => {
            this.setState({ carousel_media_index: $(`#${this.carousel_id} div.active`).index() }); // Aggiorna indice media attualmente attivo
        })
    }

    render() {
        const tweet = this.props.tweet;

        return (<>
            {/* <a href={"https://twitter.com/twitter/status/" + tweet.id} target="_blank" rel="noreferrer" className="list-group-item list-group-item-action px-4 pt-4" aria-current="true"> */}
            <div className="list-group-item list-group-item-action px-4 pt-4">
                <TweetUser tweet={tweet} time_format="DD-MM-YYYY HH:mm" />

                <p className="m-0 mt-2" style={{fontSize: "0.95rem", overflowWrap: "break-word"}}>{he.decode(tweet.text)}</p>
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
                    <div className={tweet.media.length>1 ? "h-100" : "d-none"}>
                        <button className={`carousel-control-prev my-auto ${css["button-carousel-navigation"]} ${this.state.carousel_media_index === 0 ? "d-none" : ""}`} type="button" data-bs-target={`#media-carousel-${tweet.id}`} data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className={`carousel-control-next my-auto ${css["button-carousel-navigation"]} ${this.state.carousel_media_index === tweet.media.length-1 ? "d-none" : ""}`} type="button" data-bs-target={`#media-carousel-${tweet.id}`} data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                <div className="d-flex w-100 justify-content-between mt-1">
                    <div className="d-flex align-items-center">
                        <img className="mx-2" src={`${process.env.PUBLIC_URL}/icons/Tweet/comment.png`} alt="" style={{ width:"1.2em", height:"1.2em" }} />
                        <p className="mt-3 small text-muted">{tweet.comments}</p>
                    </div>
                    <div className="d-flex align-items-center">
                        <img className="mx-2" src={`${process.env.PUBLIC_URL}/icons/Tweet/retweet.png`} alt="" style={{ width:"1.2em", height:"1.2em" }} /> 
                        <p className="mt-3 small text-muted">{tweet.retweets}</p>
                    </div>
                    <div className="d-flex align-items-center ">
                        <img className="mx-2" src={`${process.env.PUBLIC_URL}/icons/Tweet/like.png`} alt="" style={{ width:"1.2em", height:"1.2em" }} /> 
                        <p className="mt-3 small text-muted">{tweet.likes}</p> 
                    </div>
                </div>
                
                <TweetLocation tweet={tweet} />

                <Sentiment tweet={tweet.text} />
            {/* </a> */}
            </div>
        </>);
    }
}

export default Tweet;