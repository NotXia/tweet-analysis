/**
 * Componente per creare una linea con freccia.
 * Ha le stesse proprietà di Polyline (Leaflet)
 * 
 * In aggiunta:
 * - hoverColor     Colore per le frecce puntate dal mouse
 */

import React from "react"
import { Polyline } from "react-leaflet"
import "leaflet-arrowheads"


export default class ArrowPolyline extends React.Component {
    constructor(props) {
        super(props);
        this.polyline_ref = React.createRef();
    }

    componentDidMount() {
        const polyline = this.polyline_ref.current;

        polyline.arrowheads({ size: "15px", frequency: "endonly" });
        
        polyline.on("mouseover", () => {
            polyline.setStyle({
                weight: 4,
                color: this.props.hoverColor
            });
            polyline.arrowheads({ size: "20px", frequency: "endonly", color: this.props.hoverColor });
            polyline._update();
        });
        
        polyline.on("mouseout", () => {
            polyline.setStyle({
                weight: 3,
                color: this.props.color
            });
            polyline.arrowheads({ size: "15px", frequency: "endonly", color: this.props.color });
            polyline._update();
        });

        polyline._update();
    }

    componentWillUnmount() {
        this.polyline_ref.current.deleteArrowheads();
        this.polyline_ref.current.remove();
    }

    render() {
        return(
            <Polyline {...this.props} ref={this.polyline_ref} />
        );
    }
}