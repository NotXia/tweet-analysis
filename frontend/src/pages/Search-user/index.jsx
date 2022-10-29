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

            <div class="list-group col-4 ms-4 my-2">
            <Link to="" className="list-group-item list-group-item-action" aria-current="true">
                    <div className="d-flex w-100 justify-content-between">
                        <row>
                            <h5>Nickname</h5>
                            <small>@username</small>
                        </row>
                        <small>timestamp</small>
                    </div>
                    <p>Qui viene messo il contenuto del tweet</p>
                </Link>
                <Link to="" className="list-group-item list-group-item-action" aria-current="true">
                    <div className="d-flex w-100 justify-content-between">
                        <row>
                            <h5>Nickname</h5>
                            <small>@username</small>
                        </row>
                        <small>timestamp</small>
                    </div>
                    <p>altro messaggio del tweet</p>
                </Link>
            </div>

            
        </>);
    }
}

export default Search;