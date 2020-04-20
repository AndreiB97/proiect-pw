import React, {useState} from "react";
import './FAQPage.scss'
import CollapsibleItem from "./CollapsibleItem";

// TODO get FAQ from server and display


function FAQPage() {

    return (
        <div className={'FAQPage'}>
            <h1>Frequently Asked Questions</h1>
            <CollapsibleItem header={'test'} content={'lorem ipsum'}/>
        </div>
    )
}

export default FAQPage;