import React from "react"
import { Polyline } from "react-leaflet"
import "leaflet-arrowheads"

export default class ArrowPolyline extends React.Component {
    constructor(props) {
        super(props);
        this.polyline_ref = React.createRef();
    }

    componentDidMount() {
        this.polyline_ref.current.arrowheads({
            size: "15px",
            frequency: "endonly",
        });
        this.polyline_ref.current._update();
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