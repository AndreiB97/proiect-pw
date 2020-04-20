import React from "react";
import './VotePage.scss';

// TODO connect to backend and get questions
// TODO submit question (after login)
// TODO score question

function VotePage() {
    return (
        <div className={'VotePage'}>
            <div className={'ButtonsContainer'}>
                <button className={'NavigationButton'}>{'<'}</button>
                <button className={'ChoiceButton'} id={'blue_button'}>Blue</button>
                <div id={'or'}>or</div>
                <button className={'ChoiceButton'} id={'red_button'}>Red</button>
                <button className={'NavigationButton'}>{'>'}</button>
            </div>
        </div>
    )
}

export default VotePage;