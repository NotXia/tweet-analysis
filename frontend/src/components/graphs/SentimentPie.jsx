import React from "react";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { sentiment } from "../../modules/analysis/sentiment";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

//Componente che genera un grafico a torta che rappresenta il numero di tweet positivi, neutri e negativi
class SentimentPie extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sentimentArray: [0, 0, 0]
        };
    
    }

    //Ogni volta che la pagina si aggiorna (vengono caricati dei tweet), aggiorna i valori del grafico
    componentDidUpdate() {
        this.getSentimentCount().then((res) => {
            console.log(res)
            if (res[0] === this.state.sentimentArray[0] && res[1] === this.state.sentimentArray[1] && res[2] === this.state.sentimentArray[2]) { return; }
            this.setState({sentimentArray: res})
        })
    }
    
    //Mostra il grafico
    render() {
        const options = {
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Analisi del sentimento dei tweet'
                }
            },
            layout: {
                padding: {
                    bottom: 6
                }
            }
        };
        
        const data = {
            labels: ['Positivo', 'Neutro', 'Negativo'],
            datasets: [{
                data: this.state.sentimentArray,
                backgroundColor: [ '#007a1250', '#bfb90050', '#b0000050' ],
                // borderColor: [ '#007a12', '#bfb900', '#b00000' ],
                borderColor: [ '#ffffff', '#ffffff', '#ffffff' ],
                borderWidth: 3,
                hoverOffset: 8,
                hoverBorderWidth: 0
            }],
        };

        return (
            <Pie options={options} data={data} />
        );
    }

    //Restituisce un array di 3 valori ciascuno contenente il numero di tweet positivi, neutri o negativi
    async getSentimentCount() {
        let sentimentArray = [0, 0, 0];
        for (const tweet of this.props.tweets) {
            let tweetSentiment = (await sentiment(tweet.text)).sentiment;
            switch (tweetSentiment) {
                case 'positive': sentimentArray[0]++; break;
                case 'neutral': sentimentArray[1]++; break;
                case 'negative': sentimentArray[2]++; break;
            }
        }
        return sentimentArray;
    }
}

export default SentimentPie;