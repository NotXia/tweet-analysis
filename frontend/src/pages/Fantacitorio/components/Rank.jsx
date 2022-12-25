/**

    Componente per visualizzare una posizione della classifica


    Proprietà:
    - rank              Posizione nella classifica
    - politician        Nome del politico
    - points            Punti del politico
    - small             Se si vuole font piccolo

*/

import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

class Rank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const rank = this.props.rank;
        const politician = this.props.politician;
        const points = this.props.points;

        let color = null;
        switch (rank) {
            case 1:     color = "#d1b500"; break;
            case 2:     color = "#8c8c8c"; break;
            case 3:     color = "#73402c"; break;
        }

        const politician_fs =   !this.props.small ? "fs-4" : "fs-5";
        const points_fs =       !this.props.small ? "fs-5" : "fs-6";
        const upper_rank_fs =   !this.props.small ? "fs-4" : "fs-5";
        const lower_rank_fs =   !this.props.small ? "fs-5" : "fs-6";

        return (<>
            <div className="list-group-item list-group-item-action px-4 py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="text-start">
                        <p className={`m-0 mt-0 ${politician_fs} fw-semibold`}>{politician.toUpperCase()}</p>
                        <p className={`m-0 mt-2 ${points_fs}`} >{points} punti</p>
                    </div>

                    <div>
                        <p className={`fw-bold ${rank <= 3 ? upper_rank_fs : lower_rank_fs}`} style={{ color: color }}>{rank}°</p>
                    </div>
                </div>
            </div>
        </>);
    }
}

export default Rank;