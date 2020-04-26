import React from 'react';
import './App.scss';
import {HashRouter, Redirect, Route} from 'react-router-dom'
import Header from "./Header";
import VotePage from "./VotePage";
import FAQPage from "./FAQPage";
import ContactPage from "./ContactPage";
import AdminPage from "./AdminPage";
import SupportPage from "./SupportPage";

// TODO gdpr form
// TODO user name

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
                    <div>
                        {
                            localStorage.getItem('role') === '1' ?
                                <Redirect to={'/admin'}/> :
                                localStorage.getItem('role') === '2' ?
                                    <Redirect to={'/support'}/> :
                                    <span/>
                        }
                        <Route path={'/admin'} component={AdminPage}/>
                        <Route path={'/support'} component={SupportPage}/>
                        <Route exact path={'/'} component={VotePage}/>
                        <Route path={'/confirmation/:id'} component={VotePage}/>
                        <Route path={'/faq'} component={FAQPage}/>
                        <Route path={'/contact'} component={ContactPage}/>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default App;
