import React from 'react';
import './App.scss';
import {HashRouter, Redirect, Route} from 'react-router-dom'
import Header from "./Header";
import VotePage from "./VotePage";
import FAQPage from "./FAQPage";
import ContactPage from "./ContactPage";
import AdminPage from "./AdminPage";
import SupportPage from "./SupportPage";

class App extends React.Component {
    constructor(props) {
        super(props);

        const consent = localStorage.getItem('consent');

        if (!consent) {
            alert('This website uses cookies');

            localStorage.setItem('consent', 'true');
        }

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
