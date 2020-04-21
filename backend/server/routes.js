const router = require('express').Router();
const mysql = require('./dbInterface.js');
const crypto = require('crypto-js');
const users = require('./users.js');

// TODO add other routes
// TODO implement routes

const cors_header_name = 'Access-Control-Allow-Origin';
const cors_header_value = '*';

router.post('/login', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! ('username' in req.body)) {
        res.status(400).json({'error': 'Username missing'}).end();
        return;
    }

    if (! ('password' in req.body)) {
        res.status(400).json({'error': 'Password missing'}).end();
        return;
    }

    mysql.call_proc('login_user', [
            req.body.username,
            crypto.SHA1(req.body.password).toString()
        ], (result) => {
        // reasons to hate javascript: callbacks
        if (result.length === 0) {
            mysql.call_proc('login_admin', [
                    req.body.username,
                    crypto.SHA1(req.body.password).toString()
                ], (result) => {
                if (result.length === 0) {
                    res.status(200).json({'error': 'Wrong Username or Password'}).end();
                } else {
                    const token = users.log_admin(result[0]);

                    res.status(200).json({
                        'token': token,
                        'role': result[0].Role,
                    }).end();
                }
            });
        } else {
            const token = users.log_user(result[0]);

            res.status(200).json({
                'token': token
            }).end();
        }
    });
});

router.post('/register', (req, res) => {
    // TODO send confirmation email

    res.header(cors_header_name, cors_header_value);

    if (! ('username' in req.body)) {
        res.status(400).json({'error': 'Username missing'}).end();
        return;
    }

    if (! ('password' in req.body)) {
        res.status(400).json({'error': 'Password missing'}).end();
        return;
    }

    if (! ('email' in req.body)) {
        res.status(400).json({'error': 'E-Mail missing'}).end();
        return;
    }

    mysql.call_proc('username_taken', [req.body.username], (result) => {
        // reasons to hate javascript: callbacks
        if (result.length === 0) {
            mysql.call_proc('email_taken', [req.body.email], (result) => {
                if (result.length === 0) {
                    mysql.call_proc('register_user', [
                        req.body.username,
                        crypto.SHA1(req.body.password).toString(),
                        req.body.email
                    ], () => {
                        res.status(200).end();
                    })
                } else {
                    res.status(200).json({'error': 'E-Mail taken'}).end();
                }
            })
        } else {
            res.status(200).json({'error': 'Username taken'}).end();
        }
    });
});

router.get('/questions', (req, res) => {
    console.log(req.query);
    res.status(500).json({'error': 'not implemented'}).end();
});

router.get('/faq', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    mysql.call_proc('get_flagged_important_messages', [], (result) => {
        console.log(result);
        res.status(200).json({
            'faq': result
        }).end();
    });
});

router.put('/contact', (req, res) => {
    // TODO email when answered
    res.header(cors_header_name, cors_header_value);

    if (! ('message' in req.body)) {
        res.status(400).json({'error': 'Message missing'}).end();
        return;
    }

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const token = req.headers.authorization.split(' ')[1];

    const user_data = users.get_user(token);

    if (user_data !== undefined) {
        mysql.call_proc('add_message', [user_data.UserID, req.body.message], () => {

        });
    }

    res.status(200).end();
});

router.get('/contact', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const token = req.headers.authorization.split(' ')[1];

    const user_data = users.get_user(token);

    if (user_data !== undefined) {
        mysql.call_proc('get_user_messages_no_response', [user_data.UserID],
            (no_response_result) => {
            mysql.call_proc('get_user_messages_with_response', [user_data.UserID],
                (with_response_result) => {
                res.status(200).json({
                    'no_response_messages': no_response_result,
                    'with_response_messages': with_response_result
                }).end();
                })
        });
    } else {
        res.status(200).json({'error': 'Not logged in'}).end();
    }
});

module.exports = router;