import React from "react";
import axios from 'axios';
import './Account.scss';

class Account extends React.Component {
    constructor(props) {
        super(props);

        // reasons to hate javascript: this
        this.onLogin = this.onLogin.bind(this);
        this.onRegister = this.onRegister.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.getLoginDropdown = this.getLoginDropdown.bind(this);
        this.getRegisterDropdown = this.getRegisterDropdown.bind(this);

        this.state = {
            'login_message': '',
            'register_message': ''
        };
    }

    async onLogin() {
        let params = new URLSearchParams();

        params.append('username', this.state.login_username);
        params.append('password', this.state.login_password);

        const response = await axios.post(
            'http://localhost:80/login',
            params
        );

        if (response.data && 'error' in response.data) {
            this.setState({'login_message': response.data.error});
        } else {
            if ('role' in response.data) {
                localStorage.setItem('role', response.data.role);
            }

            localStorage.setItem('username', this.state.login_username);
            localStorage.setItem('token', response.data.token);
        }

        this.props.refresh();
    };

    async onRegister() {
        let params = new URLSearchParams();

        params.append('email', this.state.register_email);
        params.append('username', this.state.register_username);
        params.append('password', this.state.register_password);

        const response = await axios.post(
            'http://localhost:80/register',
            params
        );

        if ('error' in response.data) {
            this.setState({'register_message': response.data.error});
        } else {
            this.setState({'register_message': 'Registration complete'});
        }

        this.props.refresh();
    };

    onLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
    }

    getLoginDropdown() {
        return (
            <div className={'Dropdown'}>
                <button className={'DropdownButton'}>Login</button>
                <div className={'DropdownContent'}>
                    <form className={'AccountForm'} onSubmit={this.onLogin}>
                        <input type={'text'} size={'32'} maxLength={'32'} placeholder={'Username'}
                               pattern={'.{4,}'} onChange={(event) => {
                            this.setState({'login_username': event.target.value});
                        }} required/>
                        <input type={'password'} size={'32'} maxLength={'32'} placeholder={'Password'}
                               pattern={'.{4,}'} onChange={(event) => {
                            this.setState({'login_password': event.target.value});
                        }} required/>
                        <input className={'Submit'} type={'submit'} value={'Login'}/>
                        <p className={'Message'}>{this.state.login_message}</p>
                    </form>
                </div>
            </div>
        )
    }

    getRegisterDropdown() {
        return (
            <div className={'Dropdown'}>
                <button className={'DropdownButton'}>Register</button>
                <div className={'DropdownContent'}>
                    <form className={'AccountForm'} onSubmit={this.onRegister}>
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
                        <input className={'Submit'} type={'submit'} value={'Register'}/>
                        <p className={'Message'}>{this.state.register_message}</p>
                    </form>
                </div>
            </div>
        )
    }

    render() {
        if (localStorage.getItem('token') !== null) {
            return (
                <nav className={'Account'}>
                    <p>
                        {'Welcome back '}
                        <span className={'Highlight'}>
                            {localStorage.getItem('username')}
                        </span>
                        {'! '}
                        <a href={''} onClick={this.onLogout} className={'Logout'}>
                            (Log out)
                        </a>
                    </p>
                </nav>
            )
        } else {
            return (
                <nav className={'Account'}>
                    {this.getLoginDropdown()}
                    {this.getRegisterDropdown()}
                </nav>
            );
        }
    }
}

export default Account;