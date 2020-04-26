const jwt = require('jsonwebtoken');

let logged_users = {};
let logged_admins = {};

const options = {};

function log_user(user_data) {
    const token = generate_token({
        'username': user_data.Username,
        'password': user_data.Password
    });

    logged_users[token] = {
        'UserID': user_data.UserID,
        'Email': user_data.Email
    };

    return token;
}

function log_admin(user_data) {
    const token = generate_token({
        'username': user_data.Username,
        'password': user_data.Password
    });

    logged_admins[token] = {
        'AdminID': user_data.AdminID,
        'Role': user_data.Role
    };

    return token;
}

function generate_token(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
}

function get_user(token) {
    return logged_users[token];
}

function get_admin(token) {
    return logged_admins[token];
}

exports.log_user = log_user;
exports.log_admin = log_admin;
exports.get_user = get_user;
exports.get_admin = get_admin;