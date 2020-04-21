import React from "react";
import './FAQPage.scss';
import CollapsibleItem from "./CollapsibleItem";
import axios from 'axios';

class FAQPage extends React.Component {
    constructor(props) {
        super(props);

        this.getFAQ = this.getFAQ.bind(this);

        this.state = {
            'faq': []
        };
    }

    async getFAQ() {
        const result = await axios.get(
            'http://localhost:80/faq'
        );

        this.state.faq = result.data.faq;
        this.forceUpdate();
    }

    async componentDidMount() {
        console.log('here');
        console.log(this.state);
        await this.getFAQ();
        console.log(this.state);
    }

    render() {
        /*

         */
        return (
            <div className={'FAQPage'}>
                <h1>Frequently Asked Questions</h1>
                {
                    this.state.faq.map((item) => {
                        return (
                            <CollapsibleItem header={item.Message.substr(0, 32)}
                                             content={item.Message} response={item.Response} />
                            );
                    })
                }
            </div>
        );
    }
}

export default FAQPage;