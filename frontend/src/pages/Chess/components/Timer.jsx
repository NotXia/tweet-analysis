/*
    Visualizza un timer con granularità al secondo

    Metodi:
    - setTime(ms)   Imposta il valore del timer
*/

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";


class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0
        };

        this.current_decrease = null;
    }

    render() {
        return (
            <span className="fs-1 fw-bold">
                { this._msToTime(this.state.time) }
            </span>
        );
    }

    _msToTime(ms) {
        let minutes = Math.floor(ms / 60000);
        let seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    _decrease() {
        let time = this.state.time-1000;
        if (time < 0) { time = 0; }

        this.setState({ time: time }, () => {
            if (this.state.time > 0) {
                this.current_decrease = setTimeout(() => {
                    this._decrease();
                }, 1000);
            }
        })
    }

    setTime(ms) {
        if (ms < 0) { return this.setState({ time: 0 }); }
        clearTimeout(this.current_decrease);

        this.setState({ time: ms+1000 }, () => {
            this._decrease();
        })
    }
}

export default Timer;