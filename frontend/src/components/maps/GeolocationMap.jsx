import React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { sameTweets } from "../../modules/utilities/tweetListComparison";
import moment from "moment"
import "leaflet/dist/leaflet.css";
import 'react-leaflet-markercluster/dist/styles.min.css';


L.Icon.Default.mergeOptions({   //Imposta l'immagine dei marker
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const tileLayer = {             //Credits
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
}

/**
 * Componente che crea una mappa con markers dei tweet geolocalizzati.
 * Utilizzo: <GeolocationMap tweets={tweets} zoom? width? height? />
 * - @param tweets     indica l'array di oggetti contenente i tweet.
 * - @param zoom       (non obbligatorio) indica il livello di zoom iniziale
 * - @param width      (non obbligatorio) indica la larghezza della mappa
 * - @param height     (non obbligatorio) indica l'altezza della mappa
 */
class GeolocationMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geo_isPresent: false,
            center_coords: {
                lat: 0,
                long: 0
            },
            
            map_settings: {     //Impostazioni generali della mappa         
                zoom: 0,
                width: "",
                height: ""
            },

            markers: [{         //Array dei markers attuali
                id: "",
                lat: 0,
                long: 0,
                user: "",
                time: ""
            }]
        }
    }

    //Alla chiamata del componente viene impostata la dimensione della mappa
    componentDidMount() {
        this.setState({     
            map_settings: {
                zoom: this.props.zoom? this.props.zoom : 10,
                width: this.props.width? this.props.width : "100%",
                height: this.props.height? this.props.height : "96.7vh"
            }
        })
    }

    shouldComponentUpdate(next_props, next_state) {
        return !sameTweets(this.props.tweets, next_props.tweets) ||
            JSON.stringify(this.state.markers) !== JSON.stringify(next_state.markers);
    }

    //Quando riceve nuovi tweets ne ricava i markers e aggiorna l'array dei markers corrente
    componentDidUpdate() {
        let markers = this.markerBuilder();
        this.setState({
            geo_isPresent: (markers.length > 0 ? true : false),
            markers: markers
        });

        // Se presenti, imposta il primo marker come centro della visuale
        if(markers[0]) {
            this.setState({
                center_coords: {
                    lat: markers[0].lat,
                    long: markers[0].long
                }
            })
        }
    }

    render() {
        return (
            <div id="map" className={this.state.geo_isPresent? "" : "text-center"}>
                {
                    this.state.geo_isPresent ?
                    <div>
                        <p className="m-0 mt-2 text-center mark"><b>{this.state.markers.length}</b> {this.state.markers.length > 1? "markers presenti" : "marker presente"}</p>
                        <MapContainer 
                            className="rounded-4 border border-grey"
                            center={[this.state.center_coords.lat, this.state.center_coords.long]} 
                            zoom={this.state.map_settings.zoom} 
                            style={{width: this.state.map_settings.width, height: this.state.map_settings.height}} 
                            worldCopyJump={"true"}
                        >
                            <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
                                <MarkerClusterGroup>
                                    { this.state.markers.map((marker) => this.markerFetcher(marker)) }
                                </MarkerClusterGroup>
                        </MapContainer>
                    </div>
                    :
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-4 border border-dark" style={{ zIndex: "1000", backgroundColor: "#DDDDDDDD", pointerEvents: "none"  }}>
                        <p className="mt-3">Non è presente alcuna geolocalizzazione</p>
                    </div>
                }
            </div>
        );
    }

    /**
     * Prende le coordinate di tutti i tweet geolocalizzati
     * @returns Array dei marker ricavati se presenti
     */
    markerBuilder() {
        const tweets = this.props.tweets;
        let marker = [{
            id: "",
            lat: 0,
            long: 0,
            user: "",
            time: ""
        }]

        for(const tweet of tweets) {
            if(tweet.location) {
                marker.push({
                    id: tweet.id,
                    lat: tweet.location.coords.lat,
                    long: tweet.location.coords.long,
                    user: tweet.username,
                    time: tweet.time
                })
            }
        };
        marker.shift(); //Rimozione del primo elemento nullo
        return marker;
    }

    /**
     * Ritorna una versione JSX del marker richiesto
     */
    markerFetcher(marker) { 
        return (
            <Marker key={marker.id} position={[marker.lat, marker.long]}>
                <Tooltip direction="top" offset={[-15,-15]}>
                    <div className="justify-content-between" style={{width:"9vw", height:"5vh"}}>
                        <div className="text-center">
                            <p className="m-0 p-1 text-muted">@{marker.user} </p>
                            <p className="m-0 p-1 text-muted">il {moment(marker.time).format("DD-MM-YYYY HH:mm")}</p>
                        </div>
                    </div>
                </Tooltip>
            </Marker>
        ); 
    }
}

export default GeolocationMap;