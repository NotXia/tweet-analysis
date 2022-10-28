import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
import { Link } from "react-router-dom";

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (<>
            <Helmet>
                <title>Ricerca utente</title>
            </Helmet>
            
            <Navbar />

            <form className="row align-items-start p-4" method="get">
                <div className="col-3">
                    <div className="input-group flex-nowrap">
                        <span className="input-group-text bg-white" id="addon-wrapping">@</span>
                        <input className="form-control" type="text" placeholder="Inserisci un nome utente" aria-label="Username" aria-describedby="addon-wrapping" />
                    </div>
                </div>
                <div className="col p-2">
                    <input className="form-check-input" type="checkbox" value="" id="geolocalization"/> <label className="form-check-label me-2" for="geolocalization">Geolocalizzazione</label>
                    <input className="form-check-input" type="checkbox" value="" id="live-refresh"/> <label className="form-check-label me-2" for="live-refresh">Live refresh</label>
                </div>
                <input type="submit" hidden />
            </form>

            <div className="grid col-3 p-3">
                <div className="text-center">
                    Risultato della ricerca
                </div>
                <div className="grid">
                    <div className="grid">
                        <div className="row">
                            Nome Utente
                        </div>
                        <div className="row">
                            Contenuto Tweet
                        </div>
                    </div>
                </div>
            </div>

            
        </>);
    }
}

export default Search;