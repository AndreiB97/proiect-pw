const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.replay.would.you.rather@gmail.com',
        pass: 'cnqezrsxzovmrwpy'
    }
});

let awaiting_confirmation = {};

function sendConfirmation(email, user_id) {
    const options = {
        to: email,
        subject: 'Confirm Would You Rather account registration',
        text: `In order to complete your account registration please click the following link:\n` +
            `http://localhost:80/${user_id}`
    };

    const salt = Math.random();

    awaiting_confirmation[crypto.SHA1(salt + user_id).toString()] = true;

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(info.response);
        }
    })
}

function sendResponse(email, response) {
    // TODO
    const options = {
        to: email,
        subject: '',
        text: ``
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
    const status = awaiting_confirmation[id];
    if (status === undefined) {
        return {
            'message': 'Invalid confirmation link'
        }
    } else if (status) {
        return {
            'message': 'Already confirmed'
        }
    } else {
        return {
            'message': 'Confirmation finished'
        }
    }
}

exports.sendConfirmation = sendConfirmation;
exports.sendResponse = sendResponse;
exports.confirm = confirm;