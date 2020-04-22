import React from 'react';
import './App.scss';
import {HashRouter, Route} from 'react-router-dom'
import Header from "./Header";
import VotePage from "./VotePage";
import FAQPage from "./FAQPage";
import ContactPage from "./ContactPage";
import axios from "axios";

// TODO admin account page
// TODO admin should not be able to do regular user stuff so limit
// TODO gdpr form
// TODO rewrite certain parts of the code
// TODO move get messages

class App extends React.Component {
    constructor(props) {
        super(props);

        this.handler = this.handler.bind(this);
        this.get_state = this.get_state.bind(this);
        this.get_messages = this.get_messages.bind(this);

        this.state = {
            username: 'none',
            password: 'none'
        };
    }

    handler(new_state) {
        this.setState(new_state);
    }

    get_state() {
        return this.state;
    }

    async get_messages() {
        const result = await axios.get(
            'http://localhost:80/contact',
            {
                'headers': {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        )

        this.setState(result.data);
    }

    render() {
        return (
            <HashRouter>
                <div className="App">
                    <Header state={this.get_state} handler={(new_state) => {this.setState(new_state)}}
                            get_messages={this.get_messages}/>
                    <hr/>
                    <div className={'Content'}>
                        <Route exact path={'/'} component={() => {return (<VotePage state={this.get_state}
                                                                                    handler={this.handler}/>)}}/>
                        <Route path={'/faq'} component={() => {return (<FAQPage state={this.get_state}
                                                                                handler={this.handler}/>)}}/>
                        <Route path={'/contact'} component={() => {return (<ContactPage state={this.get_state}
                                                                                        handler={this.handler}
                                                                                        get_messages={this.get_messages}/>)}}/>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default App;
