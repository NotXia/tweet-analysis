import React from "react";
import ReactWordcloud from "react-wordcloud";
import { removeStopwords } from "../../modules/analysis/stopwords";

// Componente che genera una word cloud basata sulle parole più utilizzate nei tweet
// Il componente deve essere richiamato tramite <WordCloud tweets={tweets} /> e ricevere come parametro {tweet} ossia l'array di oggetti contenente i tweet
class WordCloud extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            words : [ ]
        };

        this.no_stopwords_cache = {};
    }

    // Ogni volta che la pagina si aggiorna (vengono caricati dei tweet), aggiorna i valori della word cloud
    componentDidUpdate() {
        (async () => {
            let globalWordCount = {};
            for (const tweet of this.props.tweets) {
                const wordCount = await this.wordCountOccurrencies(tweet.text);
                Object.keys(wordCount).forEach((word) => {
                    if(globalWordCount[word]) { globalWordCount[word] += wordCount[word]; }
                    else { globalWordCount[word] = wordCount[word]; }
                });
            }
            let out = Object.keys(globalWordCount).map((word) => ({
                text: word,
                value: globalWordCount[word]
            }));
            if(JSON.stringify(out) !== JSON.stringify(this.state.words)) { this.setState({words: out}); }
        })()
    }
    
    // Mostra la word cloud
    render() {
        return (
            <ReactWordcloud words={this.state.words} options= {{
                enableTooltip: true,
                deterministic: true,
                fontFamily: "impact",
                fontSizes: [10, 70],
                fontStyle: "normal",
                fontWeight: "normal",
                padding: 1,
                rotations: 1,
                rotationAngles: [0, 0],
                spiral: "archimedean",
                transitionDuration: 1000
            }} />
        );
    }

    // Restituisce un oggetto che indica le occorrenze di ogni parola non-stopword in una data frase
    async wordCountOccurrencies(sentence) {
        const original_sentence = sentence;
        
        sentence = this.no_stopwords_cache[original_sentence]; // Ricerca in cache
        if (!sentence) { // Cache miss
            sentence = original_sentence;

            sentence = sentence.replace(/(?:https?|ftp|http):\/\/[\n\S]+/g, " ");       // Rimuove URL
            sentence = sentence.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, " ");     // Rimuove emoji
            sentence = sentence.replace(/(\r\n|\n|\r)/gm, " ");     // Rimuove a capo
            sentence = sentence.toUpperCase();
            sentence = sentence.replace( /\s\s+/g, " ");            // Rimuove spazi multipli
            sentence = sentence.trim();
    
            if (sentence !== "") { 
                sentence = await removeStopwords(sentence);
                this.no_stopwords_cache[original_sentence] = sentence;
            }
        }
        
        const res = {};
    
        const words = sentence.split(" ");
    
        for(const word of words) {
            if(res[word]) { res[word]++; }
            else { res[word] = 1; }
        }
    
        return res;
    }
}

export default WordCloud;
