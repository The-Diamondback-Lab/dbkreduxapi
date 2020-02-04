const mysql = require('mysql');
const util = require('util');

require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('[mysql] Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('[mysql] Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('[mysql] Database connection was refused.');
    } else {
      console.error('[mysql] Unexpected error');
      console.error(err);
    }
  } else {
    console.log('[mysql] Connected');

    if (connection) {
      connection.release();
    }
  }
});

pool.query = util.promisify(pool.query);

module.exports = pool;
