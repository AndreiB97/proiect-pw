import React from 'react';
import './AdminPage.scss'
import AdminRegistration from "./AdminRegistration";
import AdminReviewUserSubmitted from "./AdminReviewUserSubmitted";

class AdminPage extends React.Component {
    render() {
        return (
            <div className={'AdminPage'}>
                <AdminRegistration/>
                <br/>
                <br/>
                <AdminReviewUserSubmitted/>
            </div>
        );
    }
}

export default AdminPage;
