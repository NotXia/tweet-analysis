import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";

class Fantacitorio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: []
        }
    }

    render() {
        return(<>
            <Helmet>
                <title>Scacchi</title>
            </Helmet>

            <Navbar />

            
        </>)
    }
}

export default Fantacitorio;