import {NavLink} from "react-router-dom";
import React from "react";
import axios from 'axios';
import './Header.scss';

class Header extends React.Component {
    render() {
        return (
            <div className={'Header'}>
                <div className={'Title'}>
                    <h1>Would You Rather...</h1>
                </div>
                <Nav/>
                <Account state={this.props.state} handler={this.props.handler} get_messages={this.props.get_messages}/>
            </div>
        );
    }
}

class Nav extends React.Component {
    render() {
        return (
            <nav className={'Nav'}>
                <ul>
                    <NavLink className={'NavLink'} to={'/'}><li>Home</li></NavLink>
                    <NavLink className={'NavLink'} to={'/faq'}><li>FAQ</li></NavLink>
                    <NavLink className={'NavLink'} to={'/contact'}><li>Contact</li></NavLink>
                </ul>
            </nav>
        );
    }
}

class Account extends React.Component {
    constructor(props) {
        super(props);

        // reasons to hate javascript: this
        this.onLogin = this.onLogin.bind(this);
        this.onRegister = this.onRegister.bind(this);
        this.onLogout = this.onLogout.bind(this);

        this.state = {};
        this.handler = this.props.handler;
        this.get_messages = this.props.get_messages;
    }

    async onLogin() {
        this.state.login_message = '';
        let params = new URLSearchParams();

        params.append('username', this.state.login_username);
        params.append('password', this.state.login_password);

        const response = await axios.post(
            'http://localhost:80/login',
            params
        );

        if (response.data && 'error' in response.data) {
            this.state.login_message = response.data.error;
        } else {
            this.handler({
                'role': response.data.role
            });

            this.setState({
                'logged_username': this.state.login_username
            });

            localStorage.setItem('token', response.data.token);
        }

        this.forceUpdate();
    };

    async onRegister() {
        this.state.register_message = '';

        let params = new URLSearchParams();

        params.append('email', this.state.register_email);
        params.append('username', this.state.register_username);
        params.append('password', this.state.register_password);

        const response = await axios.post(
            'http://localhost:80/register',
            params
        );

        if (response.data && 'error' in response.data) {
            this.state.register_message = response.data.error;
        } else {
            this.state.register_message = 'Registration complete'
        }

        this.forceUpdate();
    };

    onLogout() {
        localStorage.removeItem('token');

        this.setState({
            'logged_username': undefined
        });

        this.handler({
            'role': undefined
        })
    }

    render() {
        if (localStorage.getItem('token') !== null) {
            return (
                <nav className={'Account'}>
                    <p>
                        {'Welcome back '}
                        <span className={'username'}>
                            {this.state.logged_username}
                        </span>
                        {'! '}
                        <a href={''} onClick={this.onLogout} className={'logout'}>
                            (Log out)
                        </a>
                    </p>
                </nav>
            )
        } else {
            return (
                <nav className={'Account'}>
                    <div className={'dropdown'}>
                        <button className={'dropdown-button'}>Login</button>
                        <div className="dropdown-content">
                            <form className={'account-form'} onSubmit={this.onLogin}>
                                <input type={'text'} size={'32'} maxLength={'32'} placeholder={'Username'}
                                       pattern={'.{4,}'} onChange={(event) => {
                                           this.setState({'login_username': event.target.value});
                                       }} required/>
                                <input type={'password'} size={'32'} maxLength={'32'} placeholder={'Password'}
                                       pattern={'.{4,}'} onChange={(event) => {
                                           this.setState({'login_password': event.target.value});
                                       }} required/>
                                <input className={'submit'} type={'submit'} value={'Login'}/>
                                <p className={'message'}>{this.state.login_message}</p>
                            </form>
                        </div>
                    </div>

                    <div className={'dropdown'}>
                        <button className={'dropdown-button'}>Register</button>
                        <div className={'dropdown-content'}>
                            <form className={'account-form'} onSubmit={this.onRegister}>
                                <input type={'text'} size={'32'} maxLength={'64'} placeholder={'E-Mail'}
                                       pattern={'[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'} onChange={(event) => {
                                           this.setState({'register_email': event.target.value});
                                       }} required/>
                                <input type={'text'} size={'32'} maxLength={'32'} placeholder={'Username'}
                                       pattern={'.{4,}'} onChange={(event) => {
                                           this.setState({'register_username': event.target.value});
                                       }} required/>
                                <input type={'password'} size={'32'} maxLength={'32'} placeholder={'Password'}
                                       pattern={'.{8,}'} onChange={(event) => {
                                           this.setState({'register_password': event.target.value});
                                       }} required/>
                                <input className={'submit'} type={'submit'} value={'Register'}/>
                                <p className={'message'}>{this.state.register_message}</p>
                            </form>
                        </div>
                    </div>
                </nav>
            );
        }
    }
}

export default Header;