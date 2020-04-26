const router = require('express').Router();

const mysql = require('./dbInterface.js');
const users = require('./users.js');
const crypto = require('crypto-js');

const cors_header_name = 'Access-Control-Allow-Origin';
const cors_header_value = '*';

router.post('/register', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (user_data.Role !== 1) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    if (! ('username' in req.body)) {
        res.status(400).json({'error': 'Username missing'}).end();
        return;
    }

    if (! ('password' in req.body)) {
        res.status(400).json({'error': 'Password missing'}).end();
        return;
    }

    if (! ('type' in req.body)) {
        res.status(400).json({'error': 'Account type missing'}).end();
        return;
    }

    if (req.body.type !== '1' && req.body.type !== '2') {
        res.status(400).json({'error': 'Invalid account type'}).end();
        return;
    }

    mysql.call_proc('username_taken', [req.body.username], (result) => {
        // reasons to hate javascript: callbacks
        if (result.length === 0) {
            mysql.call_proc('register_admin', [req.body.username,
                crypto.SHA1(req.body.password).toString(), req.body.type], () => {
                res.status(200).end();
            });
        } else {
            res.status(400).json({'error': 'Username taken'}).end();
        }
    });
})

router.get('/user_submitted', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (user_data.Role !== 1) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    mysql.call_proc('get_user_submitted_questions', [], (result) => {
        res.status(200).json(result).end();
    });
});

router.post('/user_submitted', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (user_data.Role !== 1) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    if (! ('question_id') in req.body) {
        res.status(400).json({'error': 'Question ID missing'}).end();
        return;
    }

    if (! ('action' in req.body)) {
        res.status(400).json({'error': 'Action missing'}).end();
        return;
    }

    switch(req.body.action) {
        case '1':
            mysql.call_proc('approve_user_submitted_question', [req.body.question_id], () => {
                res.status(200).end();
            });
            break;
        case '2':
            mysql.call_proc('report_user_submitted_question_author', [req.body.question_id], () => {
                res.status(200).end();
            });
            break;
        case '3':
            mysql.call_proc('delete_user_submitted_question', [req.body.question_id], () => {
                res.status(200).end();
            });
            break;
        default:
            res.status(400).json({'error': 'Invalid action'}).end();
    }
});

router.get('/reported', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (user_data.Role !== 1) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    mysql.call_proc('get_questions_reported_by_users', [], (result) => {
        res.status(200).json(result).end();
    });
});

router.post('/reported', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (user_data.Role !== 1) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    if (! ('question_id' in req.body)) {
        res.status(400).json({'error': 'Question ID missing'}).end();
        return;
    }

    if (! ('action' in req.body)) {
        res.status(400).json({'error': 'Action missing'}).end();
        return;
    }

    if (! ('user_id' in req.body)) {
        res.status(400).json({'error': 'User ID missing'}).end();
        return;
    }

    switch(req.body.action) {
        case '1':
            mysql.call_proc('approve_question_report', [req.body.question_id], () => {
                res.status(200).end();
            });
            break;
        case '2':
            mysql.call_proc('strike_question_report_author', [req.body.question_id, req.body.user_id],
                () => {
                    res.status(200).end();
                });
            break;
        case '3':
            mysql.call_proc('delete_question_report', [req.body.question_id, req.body.user_id],
                () => {
                    res.status(200).end();
                });
            break;
        default:
            res.status(400).json({'error': 'Invalid action'}).end();
    }
});

module.exports = router;