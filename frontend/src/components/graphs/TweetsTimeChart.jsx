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

    componentDidUpdate() {
        const graph_data = this.tweetsPerDay();

        if (JSON.stringify(graph_data.labels) === JSON.stringify(this.state.labels) && JSON.stringify(graph_data.data) === JSON.stringify(this.state.data)) 
            return;
        
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

        const days = Object.keys(count);
        days.sort();
        
        return {
            labels: days.map((day) => moment.unix(day).format("DD-MM-YYYY")),
            data: days.map((day) => count[day])
        }

    }
}

export default TweetsTimeChart;
