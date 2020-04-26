const router = require('express').Router();
const crypto = require('crypto-js');

const mysql = require('./dbInterface.js');
const users = require('./users.js');
const mailer = require('./mailer.js');

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
        if (result.length === 0) {
            mysql.call_proc('login_admin', [
                req.body.username,
                crypto.SHA1(req.body.password).toString()
            ], (result) => {
                if (result.length === 0) {
                    res.status(400).json({'error': 'Wrong Username or Password'}).end();
                } else {
                    const token = users.log_admin(result[0]);

                    res.status(200).json({
                        'token': token,
                        'role': result[0].Role,
                        'username': result[0].Username
                    }).end();
                }
            });
        } else {
            const token = users.log_user(result[0]);

            res.status(200).json({
                'token': token,
                'username': result[0].Username
            }).end();
        }
    });
});

router.post('/register', (req, res) => {
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
                    mailer.sendConfirmation(req.body);
                    res.status(200).end();
                } else {
                    res.status(400).json({'error': 'E-Mail taken'}).end();
                }
            })
        } else {
            res.status(400).json({'error': 'Username taken'}).end();
        }
    });
});

function get_random_question(res) {
    mysql.call_proc('get_random_question', [], (result) => {
        res.status(200).json({'question': result}).end();
    });
}

function get_random_question_for_user(user_id, res) {
    mysql.call_proc('get_random_question_for_user', [user_id], (result) => {
        if (result.length === 0) {
            mysql.call_proc('get_random_question', [], (result) => {
                res.status(200).json({'question': result}).end();
            });
        } else {
            res.status(200).json({'question': result}).end();

            mysql.call_proc('view_question', [user_id, result[0].QuestionID], () => {});
        }
    });
}

router.get('/questions', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        get_random_question(res);
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const user_data = users.get_user(token);

        if (user_data === undefined) {
            get_random_question(res);
        } else {
            get_random_question_for_user(user_data.UserID, res);
        }
    }
});

router.post('/questions', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! ('answer' in req.body)) {
        res.status(400).json({'error': 'Answer missing'}).end();
        return;
    }

    if (! ('question_id' in req.body)) {
        res.status(400).json({'error': 'Question ID missing'}).end();
        return;
    }

    if (! req.headers.authorization) {
        mysql.call_proc('get_question_stats', [req.body.question_id], (result) => {
            res.status(200).json({'stats': result}).end();
        });
        return;
    }

    const token = req.headers.authorization.split(' ')[1];

    const user_data = users.get_user(token);

    if (user_data !== undefined) {
        mysql.call_proc('select_answer', [user_data.UserID, req.body.question_id, req.body.answer],
            () => {
                mysql.call_proc('get_question_stats', [req.body.question_id], (result) => {
                    res.status(200).json({'stats': result}).end();
                })
            });
    } else {
        mysql.call_proc('get_question_stats', [req.body.question_id], (result) => {
            res.status(200).json({'stats': result}).end();
        });
    }
});

router.put('/questions', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    const user_data = users.get_user(token);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (! ('blue' in req.body)) {
        res.status(400).json({'error': 'Blue answer missing'}).end();
        return;
    }

    if (! ('red' in req.body)) {
        res.status(400).json({'error': 'Red answer missing'}).end();
        return;
    }

    mysql.call_proc('add_user_submitted_question', [user_data.UserID, req.body.blue, req.body.red],
        () => {
            res.status(200).end();
        });
});

router.get('/faq', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    mysql.call_proc('get_flagged_important_messages', [], (result) => {
        res.status(200).json({
            'faq': result
        }).end();
    });
});

module.exports = router;