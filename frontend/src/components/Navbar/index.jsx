import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from "./navbar.module.css";
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
                <div className="navbar-nav">
                    <Link className="nav-link" aria-current="page" to="/">Home</Link>
                    <Link className="nav-link" to="/search-user">Ricerca utente</Link>
                    <Link className="nav-link" to="/">BBBB</Link>
                    <Link className="nav-link" to="/">CCCC</Link>
                </div>
                </div>
            </div>
        </nav>
        </>);
    }
}

export default Navbar;