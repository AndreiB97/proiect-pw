import React from 'react';
import './App.scss';
import {HashRouter, Redirect, Route} from 'react-router-dom'
import Header from "./Header";
import VotePage from "./VotePage";
import FAQPage from "./FAQPage";
import ContactPage from "./ContactPage";
import AdminPage from "./AdminPage";

// TODO support account page
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
                        {
                            localStorage.getItem('role') === '1' ?
                                <Redirect to={'/admin'}/> :
                                localStorage.getItem('role') === '2' ?
                                    <Redirect to={'/support'}/> :
                                    <span/>
                        }
                        <Route path={'/admin'} component={AdminPage}/>
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
