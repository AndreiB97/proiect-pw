import React from "react";
import './VotePage.scss';
import axios from "axios";

// TODO connect to backend and get questions
// TODO submit question (after login)
// TODO score question

class VotePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    async componentDidMount() {
        const result = await axios.get(
            'http://localhost:80/questions'
        )

        this.state.current_question_index = 0;
        this.state.questions = result.data.question;

        console.log(this.state);
        this.forceUpdate();
    }

    render() {
        return (
            <div className={'VotePage'}>
                <div className={'ButtonsContainer'}>
                    <button className={'NavigationButton'}>{'<'}</button>
                    <button className={'ChoiceButton'} id={'blue_button'}>
                        {
                            'questions' in this.state ?
                                this.state.questions[this.state.current_question_index].Answer1 :
                                'Blue'
                        }
                    </button>
                    <div id={'or'}>or</div>
                    <button className={'ChoiceButton'} id={'red_button'}>
                        {
                            'questions' in this.state ?
                                this.state.questions[this.state.current_question_index].Answer2 :
                                'Red'
                        }
                    </button>
                    <button className={'NavigationButton'}>{'>'}</button>
                </div>
            </div>
        )
    }
}

export default VotePage;