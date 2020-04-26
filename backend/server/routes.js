const router = require('express').Router();
const mysql = require('./dbInterface.js');
const crypto = require('crypto-js');
const users = require('./users.js');

// TODO make sure support can't do admin actions
// TODO make sure admins can't do support actions
// TODO recheck status codes
// TODO maybe split this into multiple files

const cors_header_name = 'Access-Control-Allow-Origin';
const cors_header_value = '*';

router.get('/support/messages', (req, res) => {
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

    mysql.call_proc('get_messages', [], (result) => {
        res.status(200).json(result).end();
    })
});

router.post('/support/messages', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! ('message_id' in req.body)) {
        res.status(400).json({'error': 'Message ID missing'}).end();
        return;
    }

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if ('response' in req.body) {
        mysql.call_proc('respond_to_message', [req.body.message_id, user_data.AdminID,
            req.body.response], () => {
            res.status(200).end();
        });
    } else if ('important' in req.body) {
        mysql.call_proc('flag_message_important', [req.body.message_id, req.body.important],
            () => {
            res.status(200).end();
        });
    } else {
        mysql.call_proc('report_message_author', [req.body.message_id], () => {
            res.status(200).end();
        });
    }
});

router.post('/admin/register', (req, res) => {
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

router.get('/admin/user_submitted', (req, res) => {
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

    mysql.call_proc('get_user_submitted_questions', [], (result) => {
        res.status(200).json(result).end();
    });
});

router.post('/admin/user_submitted', (req, res) => {
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

router.get('/admin/reported', (req, res) => {
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

    mysql.call_proc('get_questions_reported_by_users', [], (result) => {
        res.status(200).json(result).end();
    });
});

router.post('/admin/reported', (req, res) => {
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

// TODO maybe move these or just have them inline

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

router.put('/report', (req, res) => {
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

    if (! ('question_id' in req.body)) {
        res.status(400).json({'error': 'Question ID missing'}).end();
        return;
    }

    mysql.call_proc('report_question', [user_data.UserID, req.body.question_id, 1], () => {
        res.status(200).end();
    });
})

router.post('/score', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    const user_data = users.get_user(token);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
    }

    if (! ('score' in req.body)) {
        res.status(400).json({'error': 'Score missing'}).end();
        return;
    }

    let score;

    if (req.body.score > 0) {
        score = 1;
    } else if (req.body.score < 0) {
        score = -1;
    }

    if (! ('question_id' in req.body)) {
        res.status(400).json({'error': 'Question ID missing'}).end();
        return;
    }

    mysql.call_proc('score_question', [user_data.UserID, req.body.question_id, score], () => {
        res.status(200).end();
    });
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

router.put('/contact', (req, res) => {
    // TODO email when answered
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

    if (! ('message' in req.body)) {
        res.status(400).json({'error': 'Message missing'}).end();
        return;
    }

    mysql.call_proc('add_message', [user_data.UserID, req.body.message], () => {
        res.status(200).end();
    });
});

router.get('/contact', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const token = req.headers.authorization.split(' ')[1];

    const user_data = users.get_user(token);

    if (user_data === undefined) {
        res.status(200).json({'error': 'Invalid token'}).end();
        return;
    }

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
});

module.exports = router;