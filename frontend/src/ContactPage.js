import React from "react";
import './ContactPage.scss'
import axios from "axios";
import CollapsibleItem from "./CollapsibleItem";

class ContactPage extends React.Component {
    constructor(props) {
        super(props);

        this.onSend = this.onSend.bind(this);
        this.onTextChange = this.onTextChange.bind(this);

        this.state = {'text_value': ''};

        this.handler = this.props.handler;
    }

    onTextChange(event) {
        this.setState({'text_value': event.target.value});
    }

    async onSend() {
        let params = new URLSearchParams();

        params.append('message', this.state.text_value);

        await axios.put(
            'http://localhost:80/contact',
            params,
            {
                headers: {
                    'Authorization': `Bearer ${this.props.state().token}`
                }
            }
        );

        this.state.text_value = '';

        this.forceUpdate();

        await this.props.get_messages();
    }

    render() {
        if ('token' in this.props.state()) {
            return (
                <div className={'ContactPage'}>
                    <h1>Message us below</h1>
                    <form onSubmit={this.onSend}>
                        <textarea className={'text-box'} value={this.state.text_value} autoFocus={true} maxLength={'512'}
                                  onChange={this.onTextChange} placeholder={'Maximum 512 characters.'} required/>
                        <input className={'send-button'} type={'submit'} value={'Send'}/>
                    </form>
                    <br/>
                    <br/>
                    <Conversations state={this.props.state} handler={this.props.handler}/>
                </div>
            )
        } else {
            return (
                <div className={'ContactPage'}>
                    <h1>You must be logged in to send messages.</h1>
                </div>
            )
        }
    }
}

class Conversations extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={'Conversations'}>
                {this.props.state().with_response_messages ?
                    <span>
                        <h1>Answered messages:</h1>
                        {this.props.state().with_response_messages.map((message) => {
                            return <CollapsibleItem header={message.Message.substr(0, 32)}
                                                    content={message.Message} response={message.Response}
                                                    admin_name={message.Username} />
                        })}
                    </span> :
                    <span></span>
                }
                {this.props.state().no_response_messages ?
                    <span>
                        <h1>Not yet answered messages:</h1>
                        {this.props.state().no_response_messages.map((message) => {
                            return <CollapsibleItem header={message.Message.substr(0, 32)}
                                                    content={message.Message} response={message.Response}
                                                    admin_name={message.Username} />
                        })}
                    </span> :
                    <span></span>
                }
            </div>
        )
    }
}

export default ContactPage;