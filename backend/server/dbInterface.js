const mysql = require('mysql');


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Connected to the database.');
});

function call_proc(proc_name, params, callback) {
    let query = `CALL ${proc_name}`;

    if (params === undefined || params.length === 0) {
        query += '();';
    } else {
        query += '(';

        for (let param in params) {
            query += `?,`;
        }

        // get rid of trailing ,
        query = query.substr(0, query.length - 1);

        query += ');';
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            throw error;
        }

        callback(results[0]);
    });
}

exports.call_proc = call_proc;