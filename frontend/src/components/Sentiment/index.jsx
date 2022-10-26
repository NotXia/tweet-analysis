import React from "react";
import axios from "axios";

class Sentiment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sentiment: null
        };
    }

    componentDidMount() {
    (async () => {
        const res = await axios({
            method: "GET",
            url: `${process.env.REACT_APP_API_PATH}/analysis/sentiment`,
            params: {
                tweet: this.props.tweet
            }
        });

        this.setState({ sentiment: res.data.sentiment });
    })();
    }

    render() {
        return (<>
            { this.state.sentiment }
        </>);
    }
}

export default Sentiment;