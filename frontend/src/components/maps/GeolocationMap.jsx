import React from "react";
import L, { latLng } from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import moment from "moment"

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const __map_settings = {
    map: {
        zoom: 12,
        width: "100%",
        height: "30vh"
    },
    tileLayer: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
    }
}

class GeolocationMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geo_isPresent: false,
            center_coords: latLng
        }
    }

    mapBuilder() {
        const tweets = this.props.tweets;
        let markers = this.markerFetcher(tweets);

        if(!this.state.geo_isPresent) {
            return <p>Non è presente alcuna geolocalizzazione</p>
        }

        return (
            <MapContainer center={this.state.center_coords} zoom={__map_settings.map.zoom} style={{width: __map_settings.map.width, height: __map_settings.map.height}}>
                <TileLayer url={__map_settings.tileLayer.url} attribution={__map_settings.tileLayer.attribution} />
                <MarkerClusterGroup>
                    {markers}
                </MarkerClusterGroup>
            </MapContainer>
        );

    }

    markerFetcher(tweets) {
        let markers = [];
        let count = 0;
        for(const tweet of tweets) {
            if(tweet.location) {
                count++;
                let newMarker = {
                    latLng: new L.latLng(tweet.location.coords.lat, tweet.location.coords.long),
                    key: tweet.id,
                    text:   <div className="justify-content-between " style={{width:"10vw", height:"5vh"}}>
                                <div className="text-center">
                                    <p className="m-0 p-1 text-muted">@{tweet.username} </p>
                                    <p className="m-0 p-1 text-muted">il {moment(tweet.time).format("DD-MM-YYYY HH:mm")}</p>
                                </div>
                            </div>
                };
                if (!this.state.geo_isPresent) this.setState({geo_isPresent: true, center_coords: newMarker.latLng});
                markers.push(
                            <Marker key={newMarker.key} position={newMarker.latLng}>
                                <Tooltip direction="top" offset={[-15,-15]}>{newMarker.text}</Tooltip>
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