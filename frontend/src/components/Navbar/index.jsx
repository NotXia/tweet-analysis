import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (<>
        <nav className="navbar navbar-dark navbar-expand-lg bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Navbar</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#__navbar" aria-controls="__navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="__navbar">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item dropdown">
                            <Link className="nav-link dropdown-toggle" to="" role="button" data-bs-toggle="dropdown" aria-expanded="false">Ricerca</Link>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link className="dropdown-item" to="/search-hashtag">Ricerca per hashtag</Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/search-user">Ricerca utente</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/">BBBB</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/">CCCC</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        </>);
    }
}

export default Navbar;