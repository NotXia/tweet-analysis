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

const __map_settings = {    //Impostazioni generali della mappa
    map: {          
        zoom: 12,
        width: "100%",
        height: "30vh"
    },
    tileLayer: {    //Credits
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
    }
}

/**
 * Componente che crea una mappa con markers dei tweet geolocalizzati
 * Utilizzo: <GeolocationMap tweets={tweets} /> dove tweets indica l'array di oggetti contenente i tweet.
 */
class GeolocationMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geo_isPresent: false,
            center_coords: latLng
        }
    }

    /**
     * Imposta la mappa
     * @returns La mappa impostata se sono presenti tweet geolocalizzati 
     */
    mapBuilder() {
        const tweets = this.props.tweets;
        let markers = this.markerFetcher(tweets);

        if(!this.state.geo_isPresent) {
            return <p>Non è presente alcuna geolocalizzazione</p>
        }

        return (
            <MapContainer center={this.state.center_coords} zoom={__map_settings.map.zoom} style={{width: __map_settings.map.width, height: __map_settings.map.height}} worldCopyJump={"true"}>
                <TileLayer url={__map_settings.tileLayer.url} attribution={__map_settings.tileLayer.attribution} />
                    <MarkerClusterGroup>
                        {markers}
                    </MarkerClusterGroup>
            </MapContainer>
        );

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
                    <Marker key={tweet.key} position={[lat, long]}>
                        <Tooltip direction="top" offset={[-15,-15]}>
                            <div className="justify-content-between " style={{width:"10vw", height:"5vh"}}>
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
    
    render() {
        return (
            <div id="map" className={this.state.geo_isPresent? "" : "text-center"}>
                {
                    this.mapBuilder()
                }
            </div>
        );
    }
}

export default GeolocationMap;