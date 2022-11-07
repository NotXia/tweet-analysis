import React from "react";
import D3WordCloud from 'react-d3-cloud';
import { removeStopwords } from "../../modules/analysis/stopwords";
import $ from "jquery";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { sameTweets } from "../../modules/utilities/tweetListComparison";


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

    shouldComponentUpdate(next_props, next_state) {
        return !sameTweets(this.props.tweets, next_props.tweets) ||
               JSON.stringify(this.state.words) !== JSON.stringify(next_state.words);
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
                const all_values = Object.values(globalWordCount);
                const min_count_value = Math.min(...all_values);
                const max_count_value = Math.max(...all_values);
                
                this.setState({
                    words: out,
                    min_count: min_count_value,
                    max_count: max_count_value
                }); 
            }
        })()
    }
    
    // Mostra la word cloud
    render() {
        return (
            <div id="__container_wordcloud" className={`w-100 h-100`} style={{position: "relative"}}>
                <span id="__tooltip_wordcloud" className="p-1 px-2" style={{position:"fixed", top: 0, left: 0, backgroundColor: "#e0e0e0", borderRadius: "0.7rem", display: "none"}}></span>
                <D3WordCloud
                    width={$("#__container_wordcloud").width()}         // Prende le dimensioni del contenitore
                    height={$("#__container_wordcloud").height()}       //
                    data={JSON.parse(JSON.stringify(this.state.words))} // Serve fare una copia perché apparentemente cambia i valori dello stato
                    font="impact" fontSize={(word) => this.scaleToFontSize(word.value, 15, 70)}
                    spiral="rectangular"
                    rotate={(_) => 0}   // Nessuna rotazione
                    random={() => 0.5}  // Generazione deterministica
                    onWordMouseOver={(event, d) => {
                        $("#__tooltip_wordcloud").show();
                        $("#__tooltip_wordcloud").css({ top: event.clientY, left: event.clientX });
                        $("#__tooltip_wordcloud").html(`${d.text} ${d.value}`);
                        $(event.target).animate({ "font-size": `${parseInt($(event.target).css("font-size"))+5}px` }, 0);
                    }}
                    onWordMouseOut={(event, d) => {
                        $("#__tooltip_wordcloud").hide();
                        $(event.target).animate({ "font-size": `${parseInt($(event.target).css("font-size"))-5}px` }, 0);
                    }}
                />
            </div>
        );
    }

    scaleToFontSize(value, min_font, max_font) {
        return _offsetIntervalTo(value, [this.state.min_count, this.state.max_count], [min_font, max_font]);
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
