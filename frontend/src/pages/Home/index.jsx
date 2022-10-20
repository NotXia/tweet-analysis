import React from "react";
import { Helmet } from 'react-helmet'

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (<>
            <Helmet>
                <title>Homepage</title>
            </Helmet>
            
            <h1>Homepage</h1>
        </>);
    }
}

export default Home;