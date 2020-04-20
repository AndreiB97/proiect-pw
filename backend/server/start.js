const express = require('express');
const routes = require('./routes.js');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/', routes);


app.use((err, req, res, next) => {
    let status = 500;
    let message = 'Unknown server error';

    if (err.httpStatus) {
        status = err.httpStatus;
        message = err.message;
    }

    res.status(status).json({
        error: message
    });
});

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${process.env.PORT}`);
});