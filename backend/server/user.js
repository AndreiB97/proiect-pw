const router = require('express').Router();

const mysql = require('./dbInterface.js');
const users = require('./users.js');

const cors_header_name = 'Access-Control-Allow-Origin';
const cors_header_value = '*';

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
        return;
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

router.put('/contact', (req, res) => {
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
        res.status(400).json({'error': 'Invalid token'}).end();
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