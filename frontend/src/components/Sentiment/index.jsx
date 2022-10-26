/**
 * 
 * Componente per l'analisi del sentimento di un Tweet
 * In base alla modalità selezionata, visualizza il risultato sottoforma di testo o immagine
 * 
 * Proprietà:
 * - tweet:string      Testo del tweet da analizzare
 * - positive:string   Testo o percorso dell'immagine da visualizzare per risultati positivi
 * - neutral:string    Testo o percorso dell'immagine da visualizzare per risultati neutri
 * - negative:string   Testo o percorso dell'immagine da visualizzare per risultati negativi
 * 
 * Attributi:
 * - image             Se si vuole il risultato visualizzato come immagine (è obbligatorio indicare il percorso delle immagine)
 * - text [default]    Se si vuole il risultato visualizzato come testo (se non viene indicato, viene utilizzato del testo di default)
 * 
 */

import React from "react";
import axios from "axios";

class Sentiment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sentiment: null
        };

        // Gestione errori parametri componente
        if (!this.props.tweet)                          { throw new Error("Tweet da analizzare mancante"); }
        if (this.props.image && this.props.text)        { throw new Error("Indicare solo una modalità tra 'text' e 'image'"); }
        if (this.props.image && !this.props.positive)   { throw new Error("Non è stata indicata l'immagine per positive"); }
        if (this.props.image && !this.props.neutral)    { throw new Error("Non è stata indicata l'immagine per neutral"); }
        if (this.props.image && !this.props.negative)   { throw new Error("Non è stata indicata l'immagine per negative"); }
    }

    componentDidMount() {
    (async () => {
        try {
            // Analisi del tweet
            const res = await axios({
                method: "GET", url: `${process.env.REACT_APP_API_PATH}/analysis/sentiment`,
                params: {
                    tweet: this.props.tweet
                }
            });
    
            this.setState({ sentiment: res.data.sentiment });
        }
        catch (err) {
            this.setState({ sentiment: "" });
        }
    })();
    }

    render() {
        return (
            <span>
                {
                    (() => {
                        if (this.props.image) {
                            return <img src={this.getSentimentImageSource(this.state.sentiment)} alt={this.state.sentiment} style={{ maxHeight: "100%", maxWidth: "100%" }} />;
                        }
                        else {
                            return this.getSentimentText(this.state.sentiment);
                        }
                    })()
                }
            </span>
        );
    }

    /**
     * Restituisce il testo associato al sentimento
     */
    getSentimentText(sentiment) {
        switch (sentiment) {
            case "positive":    return this.props.positive ?? "🙂";
            case "neutral":     return this.props.neutral  ?? "😐";
            case "negative":    return this.props.negative ?? "☹️";
            default: return "";
        }
    }

    /**
     * Restituisce il percorso dell'immagine associato al sentimento
     */
    getSentimentImageSource(sentiment) {
        switch (sentiment) {
            case "positive":    return this.props.positive;
            case "neutral":     return this.props.neutral;
            case "negative":    return this.props.negative;
            default: return "";
        }
    }
}

export default Sentiment;