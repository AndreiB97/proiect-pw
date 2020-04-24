import {NavLink} from "react-router-dom";
import React from "react";
import Account from "./Account";
import './Header.scss';

class Header extends React.Component {
    render() {
        return (
            <div className={'Header'}>
                <div className={'Title'}>
                    <h1>Would You Rather...</h1>
                </div>
                <nav className={'Nav'}>
                    <ul>
                        <NavLink className={'NavLink'} to={'/'}><li>Home</li></NavLink>
                        <NavLink className={'NavLink'} to={'/faq'}><li>FAQ</li></NavLink>
                        <NavLink className={'NavLink'} to={'/contact'}><li>Contact</li></NavLink>
                    </ul>
                </nav>
                <Account/>
            </div>
        );
    }
}

export default Header;