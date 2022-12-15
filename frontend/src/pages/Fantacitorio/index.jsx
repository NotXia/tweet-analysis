import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Rank from './components/Rank'
import Navbar from "../../components/Navbar";
import { getPointsByWeek, getRankings } from "../../modules/games/fantacitorio";

//Costanti limite date
const today = new Date();
const date = (today.toISOString()).split("T");

const __max_date_limit = date[0];
const __min_date_limit = "2006-03-23";


class Fantacitorio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: "",
            date_result: [],                            // Risultato della ricerca per data
            ranking_result: [],                         // Risultato della classifica attuale
            query_result: [],                           // Risultato della ricerca utente
            fetching_date: false,                       // Indica se attualmente si sta ricercando per data
            fetching_user: false,                       // Indica se attualmente si sta ricercando per utente

            select_min_date: __min_date_limit,          // Limite minimo attuale della data (a init: "2006-03-23")
            select_max_date: __max_date_limit,          // Limite minimo attuale della data (a init: data di oggi)

            error_message: ""                           // Messaggio d'errore
        }
        this.input = {
            query: React.createRef()
        }
    }

    async componentDidMount() {
        try {
            const rankings = await getRankings();
            this.setState({
                ranking_result: rankings
            });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile caricare la classifica" });
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

                    {/* Messaggio d'errore */}
                    <div className="row">
                        <div className="col-12 text-center text-danger fw-semibold">
                            { this.state.error_message }
                        </div>
                    </div>

                    <div className="row justify-content-center my-2">
                        {/* Lista dei politici con punteggi */}
                        <div className="col-12 col-lg-4">
                            <h2 className="ms-1">Classifica generale</h2>
                            <div className="list-group border border-white rounded-4">
                                {   
                                    this.state.ranking_result.map((rank, index) => (
                                        <Rank key={`${rank.politician}-all`} politician={rank.politician} points={rank.points} rank={index+1} />
                                    ))
                                }
                            </div>
                        </div>

                        {/* Selezione data, panoramica settimanale e statistiche interessanti */}
                        <div className="col-12 col-lg-4">
                            <div className="sticky-top">
                                <h1 className="text-center" style={{ fontSize: "3rem"}}>Fantacitorio<br /></h1>

                                {/* Risultato settimanale */}
                                <div className="d-flex flex-column justify-content-center align-items-center w-100 border rounded-4 p-4">
                                    <h2 className="text-center">Risultati settimanali</h2>
                                    {/* Selettore data */}
                                    <form className="align-items-start">
                                        <div>
                                            <div className="d-flex align-items-end justify-content-center">
                                                <div className={`mb-2 me-2 ${this.state.fetching_date ? "" : "d-none"}`}>
                                                    <div className="spinner-grow" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="form-label small text-muted ms-1 mb-0" style={{ fontSize: "1.2rem" }} htmlFor="date">Data</label>
                                                    <input className="form-control" id="date" type="date" style={{ fontSize: "1.6rem" }}
                                                        min={this.state.select_min_date} max={this.state.select_max_date} onChange={(e) => { this.searchWeekPoints(e.target.value)}}
                                                        disabled={this.state.fetching_date} />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    
                                    {/* Punti settimanali */}
                                    <div style={{ maxHeight: "30vh" }} className="overflow-auto w-100">
                                        {
                                            this.state.date_result.map((rank, index) => (
                                                <Rank key={`${rank.politician}-weekly`} politician={rank.politician} points={rank.points} rank={index+1} small />
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="d-flex flex-column justify-content-center align-items-center w-100 border rounded-4 p-4 mt-3">
                                    <h2>Statistiche</h2>
                                </div>
                            </div>
                        </div>

                        {/* Sezione utente ed immagini squadre */}
                        <div className="col-12 col-lg-4">
                            <div className="sticky-top">
                                <div className="d-flex justify-content-center w-100 p-2">
                                    <div className="col-12 col-md-10 col-lg-10 mt-4 border border-grey rounded-4 p-3">
                                        <form className="align-items-start">
                                            <p className="ms-1 mb-3 h1" style={{ fontSize: "0.9rem" }}>Ricerca per utente</p>
                                            <div className="input-group flex">
                                                <span className="input-group-text" id="addon-wrapping">@</span>
                                                <input ref={this.state.date} className="form-control" style={{ fontSize: "0.9rem" }} id="date" type="text"/>
                                                <button className="btn btn-outline-secondary" disabled={ this.state.fetching_user } type="submit" id="button-addon1">
                                                    Cerca
                                                    <span className={`spinner-grow spinner-grow-sm ms-2 ${this.state.fetching_user ? "" : "d-none"}`} role="status" aria-hidden="true" />
                                                </button>
                                            </div>
                                            <p className="small ms-1 mt-0 mb-1" style={{ fontSize: "0.75rem"}}>Inserisci il nome utente da cui vuoi vedere la squadra</p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>)
    }

    async searchWeekPoints(date) {
        if (date === "") { return this.setState({ error_message: "", date_result: [], date: "" }); }

        date = `${date}T00:00:00Z`;

        // Inizio fetching
        this.setState({ 
            fetching_date: true, error_message: "",
            date_result: [],
            date: "",
        });

        try {
            let weeklyStats = await getPointsByWeek(date);
            weeklyStats = Object.keys(weeklyStats).map((politician) => ({
                politician: politician,
                points: weeklyStats[politician]
            }));
            weeklyStats.sort((p1, p2) => p2.points - p1.points);

            this.setState({
                date_result: weeklyStats,
                date: date
            });
        }
        catch (err) {
            console.log(err);
            this.setState({ error_message: "Si è verificato un errore durante la ricerca"});
        }

        this.setState({ fetching_date: false });
    }
}

export default Fantacitorio;