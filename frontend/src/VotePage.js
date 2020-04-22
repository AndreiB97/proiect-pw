import React from "react";
import './VotePage.scss';
import axios from "axios";

// TODO submit question (after login)
// TODO score question
// TODO report

class VotePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.get_question = this.get_question.bind(this);
        this.onPrevClick = this.onPrevClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.pick_answer = this.pick_answer.bind(this);
        this.get_button_text = this.get_button_text.bind(this);
    }

    async pick_answer(answer) {
        if (this.state.questions[this.state.current_question_index].voted === 0) {
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

            this.state.questions[this.state.current_question_index].voted = answer;
            this.state.questions[this.state.current_question_index].stats = result.data.stats[0];

            this.forceUpdate();
        }
    }

    async componentDidMount() {
        const result = await axios.get(
            'http://localhost:80/questions'
        )

        this.state.current_question_index = 0;
        this.state.questions = result.data.question;

        this.state.questions[0]['voted'] = 0;

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

        result.data.question[0]['voted'] = 0;

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

    get_button_text(button) {
        if (this.state.questions === undefined) {
            return ''
        }

        if (this.state.questions[this.state.current_question_index].voted === 0) {
            return this.state.questions[this.state.current_question_index][`Answer${button}`];
        }

        const total = this.state.questions[this.state.current_question_index].stats.Ans1Count +
            this.state.questions[this.state.current_question_index].stats.Ans2Count;

        const fraction = (
            total === 0 ?
                0 :
                (this.state.questions[this.state.current_question_index].stats[`Ans${button}Count`] / total)
        );

        // percent with 2 decimals
        const percent = Math.round(fraction * 10000) / 100;

        if (this.state.questions[this.state.current_question_index].voted === button) {
            return (
                <div>
                    <span className={'check-mark'}><strong>✓</strong></span>
                    <span className={'percent'}>{percent}%</span>
                    <br/>
                    <span className={'count'}>
                        {this.state.questions[this.state.current_question_index].stats[`Ans${button}Count`]} agree
                    </span>
                    <br/>
                    <span className={'answer'}>
                        {this.state.questions[this.state.current_question_index][`Answer${button}`]}
                    </span>
                </div>
            );
        } else {
            return (
                <div>
                    <span className={'percent'}>{percent}%</span>
                    <br/>
                    <span className={'count'}>
                        {this.state.questions[this.state.current_question_index].stats[`Ans${button}Count`]} agree
                    </span>
                    <br/>
                    <span className={'answer'}>
                        {this.state.questions[this.state.current_question_index][`Answer${button}`]}
                    </span>
                </div>
            );
        }
    }

    render() {
        return (
            <div className={'VotePage'}>
                <div className={'ButtonsContainer'}>
                    <button className={'NavigationButton'} onClick={this.onPrevClick}>{'<'}</button>
                    <button className={'ChoiceButton'} id={'blue_button'}
                            onClick={() => {this.pick_answer(1)}}>
                        {
                            this.get_button_text(1)
                        }
                    </button>
                    <div id={'or'}><strong>or</strong></div>
                    <button className={'ChoiceButton'} id={'red_button'}
                            onClick={() => {this.pick_answer(2)}}>
                        {
                            this.get_button_text(2)
                        }
                    </button>
                    <button className={'NavigationButton'} onClick={this.onNextClick}>{'>'}</button>
                </div>

            </div>
        )
    }
}

export default VotePage;