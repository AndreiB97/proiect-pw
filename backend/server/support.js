const router = require('express').Router();

const mysql = require('./dbInterface.js');
const users = require('./users.js');
const mailer = require('./mailer.js');

const cors_header_name = 'Access-Control-Allow-Origin';
const cors_header_value = '*';

router.get('/messages', (req, res) => {
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

    if (user_data.Role !== 2) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    mysql.call_proc('get_messages', [], (result) => {
        res.status(200).json(result).end();
    })
});

router.post('/messages', (req, res) => {
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

    if (user_data.Role !== 2) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    if ('response' in req.body) {
        mysql.call_proc('respond_to_message', [req.body.message_id, user_data.AdminID,
            req.body.response], () => {
            res.status(200).end();
        });

        mysql.call_proc('get_message', [req.body.message_id], (result) => {
            mailer.sendResponse(result.Email, result.Message, req.body.response, user_data.Username);
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

router.delete('/messages/:id', (req, res) => {
    res.header(cors_header_name, cors_header_value);

    const id = req.params.id;

    if (! req.headers.authorization) {
        res.status(400).json({'error': 'Token missing'}).end();
        return;
    }

    const user_data = users.get_admin(req.headers.authorization.split(' ')[1]);

    if (user_data === undefined) {
        res.status(400).json({'error': 'Invalid token'}).end();
        return;
    }

    if (user_data.Role !== 2) {
        res.status(400).json({'error': 'Wrong account role'}).end();
        return;
    }

    mysql.call_proc('delete_message', [id], () => {
        res.status(200).end();
    });
})

module.exports = router;