import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Navbar from "../../components/Navbar";

//Costanti limite date
const today = new Date();
const date = (today.toISOString()).split("T");

const __max_date_limit = date[0];
const __min_date_limit = "2006-03-23";


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
                <title>Fantacitorio</title>
            </Helmet>

            <Navbar />
            
            <main className="mt-4">
                <div className="container-fluid">
                    <div className="row my-2">
                        {/* Lista dei politici con punteggi */}
                        <div className="col-12 col-lg-4">
                            <div className="d-flex justify-content-center w-100 p-2">
                                <p>Qui verranno mostrati i politici e i loro punteggi</p>
                            </div>
                        </div>
                        {/* Barra selezione data*/}
                        <div className="col-12 col-lg-4">
                            <div className="sticky-top">
                                <div className="d-flex justify-content-center w-100 p-2">
                                    <div className="col-12 col-md-10 col-lg-8 mt-4 border border-grey rounded-4 p-3">
                                        <form className="align-items-start">
                                            <h1 className="text-center mb-3" style={{ fontSize: "2rem" }}>Fantacitorio</h1>
                                            <input ref={this.state.date} className="form-control" style={{ fontSize: "0.9rem" }} id="date" type="week" min={__min_date_limit} max={__max_date_limit}/>
                                            <p className="small ms-1 mt-0 mb-1" style={{ fontSize: "0.8rem"}}>Inserisci la settimana dove recuperare i punteggi</p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        
                    </div>
                </div>
            </main>
        </>)
    }
}

export default Fantacitorio;