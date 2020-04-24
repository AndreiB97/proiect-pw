import React from "react";
import './VotePage.scss';
import axios from "axios";

class VotePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.getQuestion = this.getQuestion.bind(this);
        this.onPrevClick = this.onPrevClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.pickAnswer = this.pickAnswer.bind(this);
        this.getButtonText = this.getButtonText.bind(this);
        this.onLikeClick = this.onLikeClick.bind(this);
        this.onDislikeClick = this.onDislikeClick.bind(this);
        this.onReportClick = this.onReportClick.bind(this);
        this.onSend = this.onSend.bind(this);
        this.sendScore = this.sendScore.bind(this);
        this.getVoteUI = this.getVoteUI.bind(this);
        this.getUserActionsUI = this.getUserActionsUI.bind(this);
        this.getSubmitForm = this.getSubmitForm.bind(this);
        this.getQuestionActions = this.getQuestionActions.bind(this);
    }

    async pickAnswer(answer) {
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
        this.state.questions = [];
        this.state.current_question_index = 0;

        await this.getQuestion();

        this.forceUpdate();
    }

    async getQuestion() {
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
            this.setState({'current_question_index': this.state.current_question_index - 1});

            this.forceUpdate();
        }
    }

    async onNextClick() {
        this.setState({'current_question_index': this.state.current_question_index + 1});

        if (this.state.current_question_index === this.state.questions.length) {
            await this.getQuestion();
        }

        this.forceUpdate();
    }

    getButtonText(button) {
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

        return (
            <div>
                {
                    this.state.questions[this.state.current_question_index].voted === button ?
                        <span className={'CheckMark'}><strong>✓</strong></span> :
                        <span/>
                }
                <span className={'Percent'}>{percent}%</span>
                <br/>
                <span className={'Count'}>
                        {this.state.questions[this.state.current_question_index].stats[`Ans${button}Count`]} agree
                    </span>
                <br/>
                <span className={'Answer'}>
                        {this.state.questions[this.state.current_question_index][`Answer${button}`]}
                    </span>
            </div>
        );
    }

    sendScore(score) {
        let params = new URLSearchParams();

        params.append('score', score);
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
    }

    onLikeClick() {
        this.state.questions[this.state.current_question_index]['like'] = 'selected-like';
        this.state.questions[this.state.current_question_index]['dislike'] = 'dislike';

        this.sendScore(1);

        this.forceUpdate();
    }

    onDislikeClick() {
        this.state.questions[this.state.current_question_index]['like'] = 'like';
        this.state.questions[this.state.current_question_index]['dislike'] = 'selected-dislike';

        this.sendScore(-1);

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

    onSend() {
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

    getVoteUI() {
        return (
            <div className={'ButtonsContainer'}>
                <button className={'NavigationButton'} onClick={this.onPrevClick}>{'<'}</button>
                <button className={'ChoiceButton'} id={'blue_button'}
                        onClick={() => {this.pickAnswer(1)}}>
                    {
                        this.getButtonText(1)
                    }
                </button>
                <div id={'or'}><strong>or</strong></div>
                <button className={'ChoiceButton'} id={'red_button'}
                        onClick={() => {this.pickAnswer(2)}}>
                    {
                        this.getButtonText(2)
                    }
                </button>
                <button className={'NavigationButton'} onClick={this.onNextClick}>{'>'}</button>
            </div>
        )
    }

    getSubmitForm() {
        return (
            <div className={'SubmitQuestion'}>
                <h1>Want to contribute? Send us your questions:</h1>
                <form onSubmit={this.onSend}>
                    <input type={'text'} maxLength={'128'} size={'64'} value={this.state.blue}
                           placeholder={'Blue answer (Maximum 128 characters)'}
                           onChange={(event) => {this.setState({'blue': event.target.value})}}/>
                    <input type={'text'} maxLength={'128'} size={'64'} value={this.state.red}
                           placeholder={'Red answer (Maximum 128 characters)'}
                           onChange={(event) => {this.setState({'red': event.target.value})}}/>
                    <input className={'Send'} type={'submit'} value={'Send'}/>
                </form>
            </div>
        )
    }

    getQuestionActions() {
        if (! ('questions' in this.state)) {
            return;
        }

        return (
            <div>
                <button className={'Report'} onClick={this.onReportClick}>
                    {
                        this.state.questions[this.state.current_question_index].reported ?
                            'Reported' :
                            'Report'
                    }
                </button>

                {
                    this.state.questions[this.state.current_question_index].voted !== 0 ?
                        <span className={'ScoreContainer'}>
                                            <button className={'Score'} onClick={this.onDislikeClick}
                                                    id={this.state.questions[this.state.current_question_index].dislike}>
                                                ⬇
                                            </button>
                                            <button className={'Score'} onClick={this.onLikeClick}
                                                    id={this.state.questions[this.state.current_question_index].like}>
                                                ⬆
                                            </button>
                                        </span> :
                        <span/>
                }
            </div>
        )
    }

    getUserActionsUI() {
        if (localStorage.getItem('token') === null) {
            return;
        }

        return (
            <div className={'UserActionsContainer'}>
                {this.getQuestionActions()}
                {this.getSubmitForm()}
            </div>
        )
    }

    render() {
        return (
            <div className={'VotePage'}>
                {this.getVoteUI()}
                {this.getUserActionsUI()}
            </div>
        )
    }
}

export default VotePage;