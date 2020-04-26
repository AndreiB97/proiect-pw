import React from "react";
import './FAQPage.scss';
import CollapsibleItem from "./CollapsibleItem";
import axios from 'axios';

class FAQPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'faq': []
        };

        this.getFAQ = this.getFAQ.bind(this);
    }

    componentDidMount() {
        this.getFAQ()
    }

    getFAQ() {
        axios.get(
            'http://localhost:80/faq'
        ).then((result) => {
            this.setState({'faq': result.data.faq});
            this.forceUpdate();
        }).catch((error) => {
            if ('response' in error) {
                console.log(error.response);
            } else {
                console.log(error);
            }
        });
    }

    render() {
        return (
            <div className={'FAQPage'}>
                <h1>Frequently Asked Questions</h1>
                {
                    this.state.faq.map((item) => {
                        return (
                            <CollapsibleItem header={item.Message}
                                             content={item.Message} response={item.Response}/>
                            );
                    })
                }
            </div>
        );
    }
}

export default FAQPage;