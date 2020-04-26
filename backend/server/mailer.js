const nodemailer = require('nodemailer');

const mysql = require('./dbInterface.js');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.replay.would.you.rather@gmail.com',
        pass: 'cnqezrsxzovmrwpy'
    }
});

let awaiting_confirmation = {};

function sendConfirmation(user_data) {
    const salt = Math.random();
    const user_id = crypto.SHA1(salt + user_data.username).toString();

    const options = {
        to: user_dataemail,
        subject: 'Confirm Would You Rather account registration',
        text: `In order to complete your account registration please click the following link:\n` +
            `http://localhost:3000/#/confirmation/${user_id}`
    };

    awaiting_confirmation[user_id] = {
        'status': true,
        'user_data': user_data
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(info.response);
        }
    })
}

function sendResponse(email, message, response, username) {
    const options = {
        to: email,
        subject: 'Your message has been answered',
        text: `You asked:\n` +
            `${message}\n` +
            `${username} says:\n` +
            response
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(info.response);
        }
    })
}

function confirm(id) {
    if (awaiting_confirmation[id] === undefined) {
        return {
            'message': 'Invalid confirmation link'
        }
    } else if (awaiting_confirmation[id].status) {
        awaiting_confirmation[id].status = false;
        awaiting_confirmation[id].user_data = undefined;

        mysql.call_proc('register_user', [awaiting_confirmation[id].user_data.username,
            crypto.SHA1(awaiting_confirmation[id].user_data.password).toString(),
            awaiting_confirmation[id].user_data.email], () => {});

        return {
            'message': 'Confirmation finished'
        }
    } else {
        return {
            'message': 'Already confirmed'
        }
    }
}

exports.sendConfirmation = sendConfirmation;
exports.sendResponse = sendResponse;
exports.confirm = confirm;