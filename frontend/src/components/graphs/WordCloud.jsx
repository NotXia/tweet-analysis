import React from "react";
import CreateWordCloud from "wordcloud";
import { removeStopwords } from "../../modules/analysis/stopwords";
import $ from "jquery";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";


/**
 * Converte il valore di un intervallo in quello corrispondente di un altro
 * Fonte: https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
 * @param {number} value                        Valore dell'intervallo di partenza
 * @param {[number, number]} source_range       Intervallo di partenza
 * @param {[number, number]} target_range       Intervallo di arrivo
 * @returns {number} Valore traslato nell'intervallo target
 */
function _offsetIntervalTo(value, source_range, target_range) {
    const [a, b] = source_range;
    const [c, d] = target_range;

    return c + ((d-c)/(b-a)) * (value-a);
}


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

    componentDidMount() {
        window.addEventListener("resize", () => {
            // Rigenera la word cloud se la finestra viene ridimensionata
            this.renderWordCloud();
        });

        $("#__canvas_wordcloud").on("mouseleave", () => {
            // Nasconde tooltip quando il mouse esce dal canvas
            $("#__tooltip_wordcloud").hide();
        })
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
            if(JSON.stringify(out) !== JSON.stringify(this.state.words)) { 
                this.setState({words: out}, () => this.renderWordCloud()); 
            }
        })()
    }
    
    // Mostra la word cloud
    render() {
        return (
            <div className="w-100 h-100" style={{position:"relative"}}>
                <span id="__tooltip_wordcloud" className="p-1 px-2" style={{position:"absolute", top: 0, left: 0, backgroundColor: "#e0e0e0", borderRadius: "0.7rem", display: "none"}}></span>
                <canvas id="__canvas_wordcloud" style={{height: "100%", width: "100%"}} height={$("#__canvas_wordcloud").height()} width={$("#__canvas_wordcloud").width()} ></canvas>
            </div>
        );
    }

    /* Ridimensiona le dimensioni del canvas (nota: la dimensione del canvas e quella indicata dal CSS sono per cose diverse) */
    resizeWordCloudCanvas() {
        let ctx = $("#__canvas_wordcloud")[0].getContext('2d');
        
        ctx.canvas.height = $("#__canvas_wordcloud").height();
        ctx.canvas.width = $("#__canvas_wordcloud").width();
    }

    /* Disenga la word cloud nel canvas */
    renderWordCloud() {
        if (this.state.words?.length === 0) { return; }

        // Genera le parole come un vettore di coppie [parola, numerosità]
        let word_count_pairs = this.state.words.map((word_entry) => [word_entry.text, word_entry.value]);
        
        // Estrazione delle prime parole più frequenti
        word_count_pairs.sort((e1, e2) => e2[1] - e1[1]);
        word_count_pairs = word_count_pairs.slice(0, 50);
        
        const min_font = 15, max_font = 70;
        const count_values = word_count_pairs.map((word_entry) => word_entry[1]);
        const min_word_count = Math.min(...count_values), max_word_count = Math.max(...count_values); // Minima e massima numerosità
        
        this.resizeWordCloudCanvas(); // Ridimensiona il canvas prima di generare la word cloud
        CreateWordCloud(document.getElementById("__canvas_wordcloud"), { 
            list: word_count_pairs,
            fontFamily: "impact", 
            minRotation: 0, maxRotation: 0,
            shrinkToFit: true,      // Se troppo grande, la dimensione viene scalata
            abortThreshold: 2000,   // Interrompe la generazione se ci mette troppo
            
            // Fattore che stabilisce la dimensione delle parole: calcolato dalla numerosità della parola scalata nell'intervallo del range del font
            weightFactor: (size) => _offsetIntervalTo(size, [min_word_count, max_word_count], [min_font, max_font]),
            
            hover: (item, dimension, event) => {
                try {
                    $("#__tooltip_wordcloud").show();
                    $("#__tooltip_wordcloud").css({ top: dimension.y-$("#__tooltip_wordcloud").height()-10, left: dimension.x });
                    $("#__tooltip_wordcloud").html(`${item[0]} ${item[1]}`)
                }
                catch (err) {
                    $("#__tooltip_wordcloud").hide();
                }
            }
        });
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
