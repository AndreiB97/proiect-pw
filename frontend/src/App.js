import React from 'react';
import './App.scss';
import {HashRouter, Redirect, Route} from 'react-router-dom'
import Header from "./Header";
import VotePage from "./VotePage";
import FAQPage from "./FAQPage";
import ContactPage from "./ContactPage";
import axios from "axios";

// TODO admin account page
// TODO gdpr form
// TODO remove useless class names

class App extends React.Component {
    constructor(props) {
        super(props);

        this.forceUpdate = this.forceUpdate.bind(this);
    }

    render() {
        return (
            <HashRouter>
                <div className="App">
                    <Header refresh={this.forceUpdate}/>
                    <hr/>
                    <div className={'Content'}>
                        <Route exact path={'/'} component={() => {return (<VotePage/>)}}/>
                        <Route path={'/faq'} component={() => {return (<FAQPage/>)}}/>
                        <Route path={'/contact'} component={() => {return (<ContactPage/>)}}/>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default App;
