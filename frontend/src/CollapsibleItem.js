import React from "react";
import './CollapsibleItem.scss';

class CollapsibleItem extends React.Component {
    constructor(props) {
        super(props);

        this.toggleCollapsible = this.toggleCollapsible.bind(this);

        this.state = {
            content_className: 'collapsible-content-hidden',
            header: this.props.header,
            content: this.props.content,
            response: this.props.response,
            admin_name: this.props.admin_name
        };
    }

    toggleCollapsible() {
        if (this.state.content_className === 'collapsible-content-hidden') {
            this.setState({
                content_className: 'collapsible-content'
            });
        } else {
            this.setState({
                content_className: 'collapsible-content-hidden'
            });
        }
    }

    render() {
        return (
            <div className={'CollapsibleItem'}>
                <button className={'collapsible'} onClick={this.toggleCollapsible}>{this.props.header}</button>

                <div className={this.state.content_className}>
                    <p className={'content'}>
                        {this.props.content}
                    </p>
                    {this.state.response ?
                        <span>
                            <hr/>
                            <p className={'admin_name'}>
                                <span className={'username'}>{this.props.admin_name}</span> says:
                            </p>
                            <p className={'response'}>
                                {this.props.response}
                            </p>
                        </span> :
                        <span></span>}
                </div>
            </div>
        )
    }
}


export default CollapsibleItem;