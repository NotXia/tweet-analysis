import React from "react";
import L, { latLng } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import moment from "moment"


L.Icon.Default.mergeOptions({   //Imposta l'immagine dei marker
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const tileLayer = {    //Credits
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
}

/**
 * Componente che crea una mappa con markers dei tweet geolocalizzati.
 * Utilizzo: <GeolocationMap tweets={tweets} zoom? width? height? />
 * - @param Tweets     indica l'array di oggetti contenente i tweet.
 * - @param zoom       (non obbligatorio) indica il livello di zoom iniziale
 * - @param width      (non obbligatorio) indica la larghezza della mappa
 * - @param height     (non obbligatorio) indica l'altezza della mappa
 */
class GeolocationMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geo_isPresent: false,
            center_coords: latLng,
            
            map_settings: {     //Impostazioni generali della mappa         
                zoom: 0,
                width: "",
                height: ""
            },

            markers: [{
                id: "",
                lat: 0,
                long: 0,
                text: ""
            }]
        }
    }

    componentDidMount() {       //Alla chiamata del componente viene impostata la dimensione della mappa
        this.setState({
            map_settings: {
                zoom: this.props.zoom? this.props.zoom : 14,
                width: this.props.width? this.props.width : "100%",
                height: this.props.height? this.props.height : "96.7vh"
            }
        })
    }

    render() {
        return (
            <div id="map" className={this.state.geo_isPresent? "" : "text-center"}>
                {
                    !this.state.geo_isPresent &&
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: "1000", backgroundColor: "#a1a1a1A0", pointerEvents: "none"  }}>
                        <p className="mt-3">Non è presente alcuna geolocalizzazione</p>
                    </div>
                }
                {
                    this.mapBuilder()
                }
            </div>
        );
    }

    /**
     * Imposta la mappa
     * @returns La mappa impostata se sono presenti tweet geolocalizzati 
     */
    mapBuilder() {
        const tweets = this.props.tweets;
        let markers = this.markerFetcher(tweets);

        if(this.state.geo_isPresent){
            return (
                <MapContainer center={this.state.center_coords} zoom={this.state.map_settings.zoom} style={{width: this.state.map_settings.width, height: this.state.map_settings.height}} worldCopyJump={"true"}>
                    <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
                        <MarkerClusterGroup>
                            {markers}
                        </MarkerClusterGroup>
                </MapContainer>
            );
        }
    }

    /**
     * Prende le coordinate di tutti i tweet geolocalizzati
     * @param {<Object[]>} tweets: array dei tweets 
     * @returns Array JSX dei marker ricavati se presenti
     */
    markerFetcher(tweets) {
        let markers = [];
        let count = 0;

        //Fetching dei tweet geolocalizzati e creazione markers
        for(const tweet of tweets) {
            if(tweet.location) {
                count++;
                let lat = tweet.location.coords.lat;
                let long =  tweet.location.coords.long;

                if (!this.state.geo_isPresent) this.setState({geo_isPresent: true, center_coords: (new L.latLng(lat, long))});

                markers.push(
                    <Marker key={tweet.id} position={[lat, long]}>
                        <Tooltip direction="top" offset={[-15,-15]}>
                            <div className="justify-content-between" style={{width:"10vw", height:"5vh"}}>
                                <div className="text-center">
                                    <p className="m-0 p-1 text-muted">@{tweet.username} </p>
                                    <p className="m-0 p-1 text-muted">il {moment(tweet.time).format("DD-MM-YYYY HH:mm")}</p>
                                </div>
                            </div>
                        </Tooltip>
                    </Marker>
                );
            }
        }
        if(count===0 && this.state.geo_isPresent) {this.setState({geo_isPresent:false})}

        return markers;
    }
    
}

export default GeolocationMap;