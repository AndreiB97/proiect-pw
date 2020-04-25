import React from 'react';
import './AdminPage.scss'
import AdminRegistration from "./AdminRegistration";
import AdminReviewUserSubmitted from "./AdminReviewUserSubmitted";
import AdminReviewReported from "./AdminReviewReported";

class AdminPage extends React.Component {
    render() {
        return (
            <div className={'AdminPage'}>
                <AdminRegistration/>
                <br/>
                <br/>
                <AdminReviewUserSubmitted/>
                <AdminReviewReported/>
            </div>
        );
    }
}

export default AdminPage;
