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
        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onRegister = this.onRegister.bind(this);
        this.onLogout = this.onLogout.bind(this);

        this.state = {};
        this.handler = this.props.handler;
        this.get_messages = this.props.get_messages;
    }

    onPasswordChange(event) {
        this.handler({'password': event.target.value});
    };

    onUsernameChange(event) {
        this.handler({'username': event.target.value});
    };

    onEmailChange(event) {
        this.handler({'email': event.target.value});
    }

    async onLogin() {
        this.state.login_message = '';
        let params = new URLSearchParams();
        const username = this.props.state().username;

        params.append('username', this.props.state().username);
        params.append('password', this.props.state().password);

        const response = await axios.post(
            'http://localhost:80/login',
            params
        );

        if (response.data && 'error' in response.data) {
            this.state.login_message = response.data.error;
        } else {
            this.handler({
                'logged_username': username,
                'token': response.data.token,
                'role': response.data.role
            });

            axios.defaults.headers.common['Authorization'] = response.data.token;

            await this.get_messages();
        }

        this.forceUpdate();
    };

    async onRegister() {
        this.state.register_message = '';

        let params = new URLSearchParams();

        params.append('email', this.props.state().email);
        params.append('username', this.props.state().username);
        params.append('password', this.props.state().password);

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
        axios.defaults.headers.common['Authorization'] = undefined;

        this.handler({
            'token': undefined,
            'logged_username': undefined,
            'role': undefined
        })
    }

    render() {
        if ('token' in this.props.state()) {
            return (
                <nav className={'Account'}>
                    <p>
                        Welcome back <span className={'username'}>{this.props.state().logged_username}</span>! <a href={''} onClick={this.onLogout} className={'logout'}>
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
                                       onChange={this.onUsernameChange} pattern={'.{4,}'} required/>
                                <input type={'password'} size={'32'} maxLength={'32'} placeholder={'Password'}
                                       onChange={this.onPasswordChange} pattern={'.{4,}'} required/>
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
                                       onChange={this.onEmailChange} pattern={'[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'}
                                       required/>
                                <input type={'text'} size={'32'} maxLength={'32'} placeholder={'Username'}
                                       onChange={this.onUsernameChange} pattern={'.{4,}'} required/>
                                <input type={'password'} size={'32'} maxLength={'32'} placeholder={'Password'}
                                       onChange={this.onPasswordChange} pattern={'.{8,}'} required/>
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