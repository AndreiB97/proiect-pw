import React from "react";
import './AdminReviewUserSubmitted.scss'
import axios from 'axios';

// TODO last page is 2 of 3?

class AdminReviewUserSubmitted extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'user_submitted': [],
            'batch_size': 15,
            'current_index': 0
        };

        this.onActionButtonClick = this.onActionButtonClick.bind(this);
        this.getSubmittedQuestions = this.getSubmittedQuestions.bind(this);
        this.getSubmittedQuestionsNavigation = this.getSubmittedQuestionsNavigation.bind(this);
    }

    async componentDidMount() {
        const options = {
            'headers': {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        const result = await axios.get(
            'http://localhost:80/admin/user_submitted',
            options
        );

        this.state.user_submitted = result.data;

        this.forceUpdate();
    }

    onActionButtonClick(question_id, action) {
        // TODO send action
        // TODO remove from array
        console.log(question_id);
    }

    getSubmittedQuestions() {
        return (
            <table cellSpacing={'0'} cellPadding={'0'}>
                <tr className={'TableHeader'}>
                    <td>Question ID</td>
                    <td>Username</td>
                    <td>Blue</td>
                    <td>Red</td>
                    <td/>
                    <td/>
                    <td/>
                </tr>

                {
                    this.state.user_submitted.map((current, index) => {
                        if (this.state.current_index <= index &&
                            this.state.current_index + this.state.batch_size > index) {
                            return (
                                <tr>
                                    <td>{current.QuestionID}</td>
                                    <td className={'Highlight'}>{current.Username}</td>
                                    <td>{current.Answer1}</td>
                                    <td>{current.Answer2}</td>
                                    <td>
                                        <button onClick={() => {
                                            this.onActionButtonClick(current.QuestionID, 1);
                                        }}>
                                            Approve
                                        </button>
                                    </td>
                                    <td>
                                        <button onClick={() => {
                                            this.onActionButtonClick(current.QuestionID, 2);
                                        }}>
                                            Report User
                                        </button>
                                    </td>
                                    <td>
                                        <button onClick={() => {
                                            this.onActionButtonClick(current.QuestionID, 3);
                                        }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        } else {
                            return <span/>
                        }
                    }, this)
                }
            </table>
        );
    }

    getSubmittedQuestionsNavigation() {
        return (
            <div className={'TableNavigation'}>
                <button onClick={() => {this.setState({'current_index': 0});}}>
                    First
                </button>
                <button onClick={() => {
                    this.setState({
                        'current_index': this.state.current_index > this.state.batch_size ?
                            this.state.current_index - this.state.batch_size :
                            0
                    });
                }}>
                    Previous
                </button>
                <span>
                    Page {
                        Math.round(this.state.current_index / this.state.batch_size) + 1
                    } of {
                        Math.ceil(this.state.user_submitted.length / this.state.batch_size)
                    }
                </span>
                <button onClick={() => {
                    this.setState({
                        'current_index':
                            this.state.current_index + this.state.batch_size < this.state.user_submitted.length ?
                                this.state.current_index + this.state.batch_size :
                                this.state.user_submitted.length > this.state.batch_size ?
                                    this.state.user_submitted.length - this.state.batch_size :
                                    0
                    });
                }}>
                    Next
                </button>
                <button onClick={() => {
                    this.setState({
                        'current_index': this.state.user_submitted.length > this.state.batch_size ?
                            this.state.user_submitted.length - this.state.batch_size :
                            0
                    });
                }}>
                    Last
                </button>
            </div>
        )
    }

    render() {
        return (
            <div className={'AdminReviewUserSubmitted'}>
                <h1>Review user submitted questions</h1>
                {
                    this.getSubmittedQuestions()
                }
                {
                    this.getSubmittedQuestionsNavigation()
                }
            </div>
        )
    }
}

export default AdminReviewUserSubmitted;