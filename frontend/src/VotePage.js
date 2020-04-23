import React from "react";
import './VotePage.scss';
import axios from "axios";

class VotePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'blue': ''
        };

        this.get_question = this.get_question.bind(this);
        this.onPrevClick = this.onPrevClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.pick_answer = this.pick_answer.bind(this);
        this.get_button_text = this.get_button_text.bind(this);
        this.onLikeClick = this.onLikeClick.bind(this);
        this.onDislikeClick = this.onDislikeClick.bind(this);
        this.onReportClick = this.onReportClick.bind(this);
        this.onSend = this.onSend.bind(this);
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
        this.state.current_question_index = 0;
        this.state.questions = result.data.question;

        this.state.questions[0]['voted'] = 0;
        this.state.questions[0]['like'] = 'like';
        this.state.questions[0]['dislike'] = 'dislike';
        this.state.questions[0]['reported'] = false;

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
        result.data.question[0]['like'] = 'like';
        result.data.question[0]['dislike'] = 'dislike';
        result.data.question[0]['reported'] = false;

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

    onLikeClick() {
        this.state.questions[this.state.current_question_index]['like'] = 'selected-like';
        this.state.questions[this.state.current_question_index]['dislike'] = 'dislike';

        let params = new URLSearchParams();

        params.append('score', 1);
        params.append('question_id', this.state.questions[this.state.current_question_index].QuestionID);

        const options = {
            'headers': {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        axios.post(
            'http://localhost:80/score',
            params,
            options
        );

        this.forceUpdate();
    }

    onDislikeClick() {
        this.state.questions[this.state.current_question_index]['like'] = 'like';
        this.state.questions[this.state.current_question_index]['dislike'] = 'selected-dislike';

        let params = new URLSearchParams();

        params.append('score', -1);
        params.append('question_id', this.state.questions[this.state.current_question_index].QuestionID);

        const options = {
            'headers': {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        axios.post(
            'http://localhost:80/score',
            params,
            options
        );

        this.forceUpdate();
    }

    onReportClick() {
        if (this.state.questions[this.state.current_question_index].reported) {
            return;
        }

        let params = new URLSearchParams();

        params.append('question_id', this.state.questions[this.state.current_question_index].QuestionID);

        const options = {
            'headers': {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        axios.put(
            'http://localhost:80/report',
            params,
            options
        );

        this.state.questions[this.state.current_question_index].reported = true;

        this.forceUpdate();
    }

    async onSend() {
        const params = new URLSearchParams();

        if (this.state.blue === '' || this.state.red === '') {
            return;
        }

        params.append('blue', this.state.blue);
        params.append('red', this.state.red);

        const options = {
            'headers': {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        axios.put(
            'http://localhost:80/questions',
            params,
            options
        );

        this.setState({
            'blue': '',
            'red': ''
        });
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
                {
                    localStorage.getItem('token') !== null ?
                        <div className={'user-actions-container'}>
                            {
                                'questions' in this.state ?
                                    <div>
                                        <button className={'report'} onClick={this.onReportClick}>
                                            {
                                                this.state.questions[this.state.current_question_index].reported ?
                                                    'Reported' :
                                                    'Report'
                                            }
                                        </button>

                                        {
                                            this.state.questions[this.state.current_question_index].voted !== 0 ?
                                                <span className={'score-container'}>
                                                    <button className={'score'} onClick={this.onDislikeClick}
                                                            id={this.state.questions[this.state.current_question_index].dislike}>
                                                        ⬇
                                                    </button>
                                                    <button className={'score'} onClick={this.onLikeClick}
                                                            id={this.state.questions[this.state.current_question_index].like}>
                                                        ⬆
                                                    </button>
                                                </span> :
                                                <span/>
                                        }
                                    </div> :
                                    <div/>
                            }

                            <div className={'submit-question'}>
                                <h1>Want to contribute? Send us your questions:</h1>
                                <form onSubmit={this.onSend}>
                                    <input type={'text'} maxLength={'128'} size={'64'} value={this.state.blue}
                                           placeholder={'Blue answer (Maximum 128 characters)'}
                                           onChange={(event) => {this.setState({'blue': event.target.value})}}/>
                                    <input type={'text'} maxLength={'128'} size={'64'} value={this.state.red}
                                           placeholder={'Red answer (Maximum 128 characters)'}
                                           onChange={(event) => {this.setState({'red': event.target.value})}}/>
                                    <input className={'send'} type={'submit'} value={'Send'}/>
                                </form>
                            </div>
                        </div> :
                        <div/>
                }
            </div>
        )
    }
}

export default VotePage;