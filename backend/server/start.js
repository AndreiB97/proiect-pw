const express = require('express');
const cors = require('cors');

const support = require('./support.js');
const admin = require('./admin.js');
const general = require('./general.js');
const user = require('./user.js');
const confirmation = require('./confirmation.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/support', support);
app.use('/admin', admin);
app.use('/', general);
app.use('/user', user);
app.use('/confirmation', confirmation);

app.use((err, req, res) => {
    let code = 500;
    let message = 'Unknown server error';

    if (err.httpStatus) {
        code = err.httpStatus;
        message = err.message;
    }

    res.status(code).json({
        'error': message
    });
});

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${process.env.PORT}`);
});