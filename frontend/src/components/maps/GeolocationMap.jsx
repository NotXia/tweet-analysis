import React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerCluster from 'react-leaflet-markercluster';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

class GeolocationMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geo_isPresent: true
        }

    }

    markerAssigner(key, coords) {
        const position = [coords.lat, coords.long];
        return <Marker key={key} position={position}></Marker>
    }

    render() {
        const tweets = this.props.tweets;
        
        return (
            <div id="map">
                <MapContainer center={[40, 10]} zoom={13} style={{width: "80%", height: "30vh"}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors" />
                    {
                       tweets.map( tweet => (tweet.location? this.markerAssigner(tweet.id, tweet.location.coords) : ""))
                    }
                </MapContainer>
            </div>
        );
    }
}

export default GeolocationMap;