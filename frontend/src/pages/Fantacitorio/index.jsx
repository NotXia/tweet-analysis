import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import Rank from './components/Rank'
import Navbar from "../../components/Navbar";
import { getPointsByWeek, getRankings, getSquads, getSquadByUsername, updateWeekPoints, getRankingStatistics } from "../../modules/games/fantacitorio";
import TweetUser from '../../components/TweetUser';

//Costanti limite date
const today = new Date();
const date = (today.toISOString()).split("T");

const __max_date_limit = date[0];
const __min_date_limit = "2006-03-23";


class Fantacitorio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: "",                                   // Data di ricerca attuale
            date_result: [],                            // Risultato della ricerca per data
            ranking_result: [],                         // Risultato della classifica attuale
            query_result: [],                           // Risultato della ricerca utente

            statistics: null,                           // Risultato statistiche

            squads: [],                                 // Vettore delle immagini squadre
            next_token: "",                             // Token alla prossima pagina delle squadre
            carousel_index: 0,                          // Indice dell'immagine nel carosello
            fetching_squads: false,                     // Indica se attualmente si sta ricercando l'immagine alla prossima squadra

            fetching_date: false,                       // Indica se attualmente si sta ricercando per data
            fetching_user: false,                       // Indica se attualmente si sta ricercando per utente
            displayed_user_squad: null,                 // Indica se attualmente si sta visualizzando per ricerca utente

            select_min_date: __min_date_limit,          // Limite minimo attuale della data (a init: "2006-03-23")
            select_max_date: __max_date_limit,          // Limite minimo attuale della data (a init: data di oggi)

            error_message: "",                          // Messaggio d'errore
            error_message_squad: ""                     // Messaggio d'errore della ricerca utente / visualizzazione squadre
        }
        this.input = {
            query: React.createRef(),                   // Input barra di ricerca per utente
            date: React.createRef(),                    // Input data
            update: {                                   // Dati presi dal form di modifica punteggio per politico
                politician: React.createRef(),              
                points: React.createRef()
            }
        }
    }

    /**
     * Al caricamento della pagina inizializza:
     * - Le squadre partecipanti individuate fino ad ora
     * - Le statistiche interessanti fino ad ora
     */
    async componentDidMount() {
        this.loadLeaderboard();

        // Caricamento immagini squadre
        try {
            this.setState({ fetching_squads: true });
            let squads_list = [];
            let curr_next_token = "";
            
            while (squads_list.length < 2) {
                const curr_squads = await getSquads(curr_next_token);
                squads_list = squads_list.concat(curr_squads.tweets);

                curr_next_token = curr_squads.next_token;
            } 

            const stats = await getRankingStatistics();
            this.setState({ 
                squads: squads_list, 
                next_token: curr_next_token, 
                fetching_squads: false, 
                statistics: stats 
            });
        }
        catch (err) {
            this.setState({ error_message_squad: "Non è stato possibile caricare la le immagini delle squadre" });
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
                            <h1 className="text-center" style={{ fontSize: "3rem" }}>Fantacitorio<br /></h1>
                            <h2 className="text-center">Classifica complessiva</h2>
                            <div className="list-group border border-white rounded-4 overflow-auto" style={{ height: "77vh" }}>
                                {   
                                    this.state.ranking_result.map((rank, index) => (
                                        <Rank key={`${rank.politician}-all`} politician={rank.politician} points={rank.points} rank={index+1} />
                                    ))
                                }
                            </div>
                        </div>

                        {/* Selezione data, panoramica settimanale e statistiche interessanti */}
                        <div className="col-12 col-lg-8">
                            <div className="sticky-top">
                                <div className="row mb-3">
                                    <div className="col-6">
                                        {/* Risultato settimanale */}
                                        <div className="d-flex flex-column justify-content-center align-items-center w-100 border rounded-4" style={{ height: "48vh" }}>
                                            <h3 className="text-center">Risultati settimanali</h3>
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
                                                            <input ref={this.input.date} className="form-control" id="date" type="date" style={{ fontSize: "1.3rem" }}
                                                                min={this.state.select_min_date} max={this.state.select_max_date} onChange={(e) => { this.searchWeekPoints(e.target.value)}}
                                                                disabled={this.state.fetching_date} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                            
                                            {/* Punti settimanali */}
                                            <div style={{ height: "25vh" }} className="overflow-auto w-100">
                                                {
                                                    this.state.date_result.map((rank, index) => (
                                                        <Rank key={`${rank.politician}-weekly`} politician={rank.politician} points={rank.points} rank={index+1} small />
                                                    ))
                                                }
                                            </div>

                                            {/* Risultato ricerca settimanale e form modifica punteggio */}
                                            {
                                                this.state.date_result.length > 0 &&
                                                <div className="mt-3">
                                                    <p className="my-1-0 h1 text-center" style={{ fontSize: "0.9rem" }} data-bs-toggle="collapse" data-bs-target="#editPoliticianScore">Modifica il punteggio di un politico ▾</p>
                                                    <div className="collapse" id="editPoliticianScore">
                                                        <form className="align-items-start" onSubmit={(e) => this.updatePoliticianPoints(e)}>
                                                            <div className="d-flex">
                                                                <input ref={this.input.update.politician} type="text" className="form-control mx-1" placeholder="Politico" required />
                                                                <input ref={this.input.update.points} type="number" className="form-control mx-1" placeholder="Punti" required />
                                                                <div className="d-flex align-items-center">
                                                                    <button className="btn btn-outline-success btn-sm" type="submit">Salva</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    {/* Statistiche interessanti */}
                                    <div className="col-6">
                                        <div className="d-flex flex-column justify-content-center align-items-center w-100 border rounded-4 p-4" style={{ height: "48vh" }}>
                                            <h2 data-bs-toggle="collapse" data-bs-target="#statistics">Statistiche ▾</h2>
                                        
                                            <div className="collapse w-100" id="statistics">
                                                <div className="border rounded-4 mt-3 mb-4">
                                                    <h3 className="m-0 text-center fw-normal fs-4 text-uppercase fw-semibold" style={{ color: "#f9aa10" }}>Best single score</h3>
                                                    <p className="m-0 text-center fs-6 text-muted">Miglior punteggio ottenuto in una singola puntata</p>
                                                    <p className="text-center m-0 mt-2 fs-5"><span className="fw-semibold">{this.state.statistics?.best_single_score.politician}</span> {this.state.statistics?.best_single_score.points} punti</p>
                                                </div>

                                                <div className="border rounded-4 my-4">
                                                    <h3 className="m-0 text-center fw-normal fs-4 text-uppercase fw-semibold" style={{ color: "#f9aa10" }}>Best average</h3>
                                                    <p className="m-0 text-center fs-6 text-muted">Miglior punteggio medio ottenuto</p>
                                                    <p className="text-center m-0 mt-2 fs-5"><span className="fw-semibold">{this.state.statistics?.best_average.politician}</span> {this.state.statistics?.best_average.points} punti in media</p>
                                                </div>

                                                <div className="border rounded-4 mt-4">
                                                    <h3 className="m-0 text-center fw-normal fs-4 text-uppercase fw-semibold" style={{ color: "#f9aa10" }}>Best climber</h3>
                                                    <p className="m-0 text-center fs-6 text-muted">Maggior numero di posizioni scalate dall'ultima classifica</p>
                                                    <p className="text-center m-0 mt-2 fs-5"><span className="fw-semibold">{this.state.statistics?.best_climber.politician}</span> {this.state.statistics?.best_climber.rank} posizioni scalate</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Box immagini squadre */}
                                <div className="row">
                                    <div className="col-12">
                        
                                        <div className="border border-grey rounded-4 p-2" style={{ height: "39vh" }}>
                                            <div className="d-flex justify-content-between w-100 h-100">
                                                <div className="w-100 h-100 align-items-start pe-2 mt-3">
                                                    <p className="text-danger m-0 fw-semibold text-center">{ this.state.error_message_squad }</p>

                                                    {/* Barra di ricerca immagine per utente */}
                                                    <form onSubmit={(e) => this.searchUserTeam(e)}>
                                                        <p className="mb-3 h1" style={{ fontSize: "0.9rem" }} data-bs-toggle="collapse" data-bs-target="#userSearch">Ricerca per utente ▾</p>
                                                        <div className="collapse" id="userSearch">
                                                            <div className="input-group flex">
                                                                <span className="input-group-text" id="addon-wrapping">@</span>
                                                                <input ref={this.input.query} className="form-control" style={{ fontSize: "0.9rem" }} id="date" type="text"/>
                                                                <button className="btn btn-outline-secondary" disabled={ this.state.fetching_user } type="submit" id="button-addon1">
                                                                    Cerca
                                                                    <span className={`spinner-grow spinner-grow-sm ms-2 ${this.state.fetching_user ? "" : "d-none"}`} role="status" aria-hidden="true" />
                                                                </button>
                                                                {
                                                                    this.state.displayed_user_squad &&
                                                                    <button className="btn btn-outline-secondary" type="button" onClick={() => this.setState({ displayed_user_squad: null })}>
                                                                        Annulla ricerca
                                                                    </button>
                                                                }
                                                            </div>
                                                            <p className="small mt-0 mb-1" style={{ fontSize: "0.75rem"}}>Inserisci il nome utente di cui vuoi vedere la squadra</p>
                                                        </div>
                                                    </form>

                                                    {/* Descrizione immagine corrente */}
                                                    <div className="mt-2">
                                                        <hr className="divider col-12 col-md-6 col-lg-4" />
                                                        <p className="fw-semibold mb-1 mt-4" style={{ fontSize: "0.9rem" }}>Squadra di:</p>
                                                        {   
                                                            this.state.displayed_user_squad ? 
                                                                <TweetUser tweet={this.state.displayed_user_squad.tweet} time_format="[Pubblicato il] DD-MM-YYYY HH:mm" />
                                                            :
                                                                <>
                                                                    {
                                                                        this.state.squads[this.state.carousel_index] &&
                                                                        <TweetUser tweet={this.state.squads[this.state.carousel_index].tweet} time_format="[Pubblicato il] DD-MM-YYYY HH:mm" />
                                                                    }
                                                                </>
                                                                
                                                        }
                                                    </div>
                                                
                                                    {/* Spinner fetching squadre */}
                                                    <div className={`${this.state.fetching_squads ? "" : "d-none"} mt-5`}>
                                                        <div className="d-flex justify-content-center">
                                                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                                <div className="spinner-border spinner-border-sm"  role="status"></div> Caricamento delle prossime immagini
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Carosello immagini squadre */}
                                                <div id="carousel-fantacitorio" className="carousel slide" style={{ width: "fit-content" }}>
                                                    <div className="carousel-inner" style={{ width: "fit-content" }}>
                                                        <div className="carousel-item active" style={{ width: "fit-content" }}>
                                                            <img src={this.state.displayed_user_squad ? this.state.displayed_user_squad.squad : this.state.squads[this.state.carousel_index]?.squad} 
                                                                 className="d-block" style={{ height: "38vh" }} alt="" />
                                                        </div>
                                                    </div>

                                                    {
                                                        !this.state.displayed_user_squad &&
                                                        <>
                                                            <button className={`carousel-control-prev ${this.state.carousel_index === 0 ? "invisible" : ""}`} type="button" onClick={() => this.carouselPrev()}>
                                                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                                                <span className="visually-hidden">Previous</span>
                                                            </button>
                                                            <button className={`carousel-control-next ${this.state.carousel_index === this.state.squads.length-1 ? "invisible" : ""}`} type="button" onClick={() => this.carouselNext()}>
                                                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                                                <span className="visually-hidden">Next</span>
                                                            </button>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Sezione utente ed immagini squadre */}
                        <div className="col-12 col-lg-4">
                            <div className="sticky-top">
                                
                            </div>
                        </div>
                        
                    </div>
                </div>
            </main>
        </>)
    }

    /**
     * Funzione per ricavare la classifica complessiva
     */
    async loadLeaderboard() {
        // Caricamento classifica generale
        try {
            const rankings = await getRankings();
            this.setState({ ranking_result: rankings });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile caricare la classifica" });
        }
    }

    /**
     * Funzione di ricerca per i punteggi della settimana richiesta
     * @param date la data da dove cercare i punteggi
     */
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
                date: date,
                error_message: weeklyStats.length === 0 ? "La classifica per la settimana inserita non è disponibile" : ""
            });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore durante la ricerca"});
        }

        this.setState({ fetching_date: false });
    }

    /**
     * Funzione per aggiornare il punteggio del politico richiesto
     * @param e nome del politico e il nuovo punteggio 
     */
    async updatePoliticianPoints(e) {
        e.preventDefault();
        try {
            await updateWeekPoints(this.input.update.politician.current.value, this.input.update.points.current.value, `${this.input.date.current.value}T00:00:00.000Z`);
            await this.searchWeekPoints(this.input.date.current.value);
            await this.loadLeaderboard();
        }
        catch(err) {
            this.setState({
                error_message: "Errore nell'aggiornamento dei punteggi"
            });
        }
    }
    
    /**
     * Funzione gestore del bottone carosello per immagine precedente
     */
    carouselPrev() {
        if (this.state.carousel_index > 0) {
            this.setState({ carousel_index: this.state.carousel_index - 1, error_message_squad: "" });
        }
    }

    /**
     * Funzione gestore del bottone carosello per immagine successiva
     */
    async carouselNext() {
        if (this.state.carousel_index < this.state.squads.length) {
            this.setState({ carousel_index: this.state.carousel_index + 1, error_message_squad: "" });

            if (this.state.carousel_index >= this.state.squads.length-3) {
                try {
                    if (!this.current_request) {
                        this.setState({ fetching_squads: true });

                        this.current_request = getSquads(this.state.next_token).then((newImages) => {
                            this.setState({
                                squads: this.state.squads.concat(newImages.tweets),
                                next_token: newImages.next_token,
                                fetching_squads: false
                            })

                            this.current_request = null;
                        });
                    }

                    await this.current_request;
                }
                catch (err) {
                    this.setState({ error_message_squad: "Non è stato possibile trovare altre squadre" });
                }
            }
        }
    }

    /**
     * Funzione per la ricerca di una squadra per nome utente (se esistente)
     * @param e nome utente
     */
    async searchUserTeam(e) {
        e.preventDefault();

        this.setState({
            fetching_user: true,
            error_message_squad: ""
        })
        try {
            const query = this.input.query.current.value;
            let res = await getSquadByUsername(query);

            this.setState({
                displayed_user_squad: res,
                fetching_user: false
            })
        }
        catch(err) {
            this.setState({
                error_message_squad: "Errore nella ricerca dell'utente",
                displayed_user_squad: null,
                fetching_user: false
            });
        }
    }

}

export default Fantacitorio;