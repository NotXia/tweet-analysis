import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import { sameTweets } from "../../modules/utilities/tweetListComparison";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
  );
  
  
/**
 * Componente che genera un grafico a barre con il numero di tweet al giorno per i tweet fetchati
 * Utilizzo: <TweetsTimeChart tweets={tweets} /> dove tweets indica l'array di oggetti contenente i tweet.
 */
class TweetsTimeChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            labels: [],
            data: []
        };
    
    }

    shouldComponentUpdate(next_props, next_state) {
        return !sameTweets(this.props.tweets, next_props.tweets) ||
               JSON.stringify(this.state.labels) !== JSON.stringify(next_state.labels) ||
               JSON.stringify(this.state.data) !== JSON.stringify(next_state.data);
    }

    componentDidUpdate() {
        const graph_data = this.tweetsPerDay();
        
        this.setState({
            labels: graph_data.labels,
            data: graph_data.data,
            chartXLimit: Math.max(this.data) + 1
        })
    }
    
    render() {
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Numero di tweets per giorno'
                  },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rect'
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        precision: 0
                    }
                }
            }
        };

        const data = {
            labels: this.state.labels,
            datasets: [
                {
                    label: 'Tweets',
                    data: this.state.data,
                    backgroundColor: 'rgba(0, 191, 255, 0.5)',
                    inflateAmount: 1,
                }
            ],
        };

        return (
            <Bar options={options} data={data} />
        );
    }

    tweetsPerDay() {
        let count = {};

        for (const tweet of this.props.tweets) {
            const timestamp = moment(tweet.time).startOf("day").unix();

            if (!(timestamp in count)) { count[timestamp] = 0; }
            count[timestamp]++;
        }

        let days = Object.keys(count);
        const start_day = Math.min(...days);
        const end_day = Math.max(...days);
        
        // Genera i giorni compresi nell'intervallo
        days = [];
        for (let i=moment.unix(start_day); i<=moment.unix(end_day); i=i.add(1, "days")) {
            const day = i.startOf("day").unix();
            days.push(day);
        }

        return {
            labels: days.map((day) => moment.unix(day).format("DD-MM-YYYY")),
            data: days.map((day) => count[day])
        }

    }
}

export default TweetsTimeChart;
