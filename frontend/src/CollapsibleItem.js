import React from "react";
import './CollapsibleItem.scss';

class CollapsibleItem extends React.Component {
    constructor(props) {
        super(props);

        this.toggleCollapsible = this.toggleCollapsible.bind(this);

        this.state = {
            content_className: 'CollapsibleContentHidden',
            header: this.props.header,
            content: this.props.content,
            response: this.props.response,
            admin_name: this.props.admin_name
        };
    }

    toggleCollapsible() {
        if (this.state.content_className === 'CollapsibleContentHidden') {
            this.setState({
                content_className: 'CollapsibleContent'
            });
        } else {
            this.setState({
                content_className: 'CollapsibleContentHidden'
            });
        }
    }

    render() {
        return (
            <div className={'CollapsibleItem'}>
                <button className={'Collapsible'} onClick={this.toggleCollapsible}>{this.props.header}</button>
                <div className={this.state.content_className}>
                    <p className={'Content'}>
                        {this.props.content}
                    </p>
                    {
                        this.state.response !== undefined ?
                            <span>
                                <hr/>
                                {
                                    'admin_name' in this.props ?
                                        <p>
                                            <span className={'Highlight'}>{this.props.admin_name}</span> says:
                                        </p> :
                                        <span/>
                                }
                                        <p>
                                    {this.props.response}
                                </p>
                            </span> :
                            <span/>
                    }
                </div>
            </div>
        )
    }
}


export default CollapsibleItem;