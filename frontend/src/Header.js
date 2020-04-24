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
                    {
                        localStorage.getItem('role') === null ?
                            <ul>
                                <NavLink className={'NavLink'} to={'/'}><li>Home</li></NavLink>
                                <NavLink className={'NavLink'} to={'/faq'}><li>FAQ</li></NavLink>
                                <NavLink className={'NavLink'} to={'/contact'}><li>Contact</li></NavLink>
                            </ul> :
                            <span/>
                    }

                </nav>
                <Account refresh={this.props.refresh}/>
            </div>
        );
    }
}

export default Header;