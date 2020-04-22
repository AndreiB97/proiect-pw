import React from "react";
import './VotePage.scss';
import axios from "axios";

// TODO submit question (after login)
// TODO score question
// TODO buttons get pressed when typing? (seems to be related to app state change)
//  maybe add a flag in app state and only get question when flag is false

class VotePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.get_question = this.get_question.bind(this);
        this.onPrevClick = this.onPrevClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.pick_answer = this.pick_answer.bind(this);
    }

    async pick_answer(answer) {
        const params = new URLSearchParams();

        params.append('question_id', this.state.questions[this.state.current_question_index].QuestionID);
        params.append('answer', answer);

        const options = {}

        if (localStorage.getItem('token') !== null) {
            options['headers'] = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }

        const result = await axios.post(
            'http://localhost:80/questions',
            params,
            options
        )

        console.log(result.data.stats[0]);
    }

    async componentDidMount() {
        const result = await axios.get(
            'http://localhost:80/questions'
        )

        this.state.current_question_index = 0;
        this.state.questions = result.data.question;

        this.forceUpdate();
    }

    async get_question() {
        let options = {};

        if (localStorage.getItem('token') !== null) {
            options['headers'] = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }

        const result = await axios.get(
            'http://localhost:80/questions',
            options
        )

        this.state.questions.push(result.data.question[0]);
    }

    onPrevClick() {
        if (this.state.current_question_index !== undefined &&
            this.state.current_question_index > 0) {
            this.state.current_question_index--;

            this.forceUpdate();
        }
    }

    async onNextClick() {
        this.state.current_question_index++;

        if (this.state.current_question_index === this.state.questions.length) {
            await this.get_question();
        }

        this.forceUpdate();
    }

    render() {
        return (
            <div className={'VotePage'}>
                <div className={'ButtonsContainer'}>
                    <button className={'NavigationButton'} onClick={this.onPrevClick}>{'<'}</button>
                    <button className={'ChoiceButton'} id={'blue_button'}
                            onClick={() => {this.pick_answer(1)}}>
                        {
                            'questions' in this.state ?
                                this.state.questions[this.state.current_question_index].Answer1 :
                                'Blue'
                        }
                    </button>
                    <div id={'or'}>or</div>
                    <button className={'ChoiceButton'} id={'red_button'}
                            onClick={() => {this.pick_answer(2)}}>
                        {
                            'questions' in this.state ?
                                this.state.questions[this.state.current_question_index].Answer2 :
                                'Red'
                        }
                    </button>
                    <button className={'NavigationButton'} onClick={this.onNextClick}>{'>'}</button>
                </div>
            </div>
        )
    }
}

export default VotePage;