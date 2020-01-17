const express = require('express');
const cors = require('cors');
const { createLogger } = require('../utilities/logger');
const db = require('../utilities/db');

const logger = createLogger('dbk-salary');

// Page size and columns for SQL table
const PAGESIZE = 10;
const COLUMNS = ['Division', 'Department', 'Title', 'Employee', 'Salary'];

// eslint-disable-next-line new-cap
const router = express.Router();
router.use(cors());

router.get('/salary', (req, res) => {
  res.redirect('https://api.dbknews.com/#tag-salary');
});

router.get('/salary/year/:year', async (req, res) => {
  const query = buildQuery(req, res);
  const countQuery = buildQuery(req, res, 'count');

  if (query == null || countQuery == null) {
    return;
  }

  const results = await runQuery(req, res, query.string, query.params);
  const count = await runQuery(req, res, countQuery.string, countQuery.params);

  sendResponse(res, 200, {
    data: results,
    count: count[0]['COUNT(*)']
  });
});

router.get('/salary/years', async (req, res) => {
  const tableQuery = {
    string: 'SHOW TABLES',
    params: []
  };

  let tables = await runQuery(req, res, tableQuery.string, tableQuery.params);

  tables = tables.map(t => t.Tables_in_saldbinstance.replace('Data', ''));

  sendResponse(res, 200, { data: tables });
});

/**
 * Takes in a request object and builds a SQL query for the Salary Guide database.
 * If no year is provided in the request parameters, then a 404 code is sent back.
 *
 * @param {Express.Request} req The request obect.
 * @param {Express.Response} res The response object.
 * @param {string} type The kind of query to build (results or count)
 * @returns An object containing the query string and a list
 * of parameters.
 */
function buildQuery(req, res, type = 'results') {
  const { year } = req.params;
  const { page, search, sortby, order } = req.query;

  if (!year){
    sendResponse(res, 404, 'No year parameter supplied.');
    return;
  }

  let offset = 0;

  if (page && !isNaN(page) && page >= 1){
    offset = (page - 1) * PAGESIZE;
  }

  let queryString = 'SELECT * FROM ??';
  const queryParams = [`${year}Data`];

  if (type === 'count') {
    queryString = 'SELECT COUNT(*) FROM ??';
  }

  if (search) {
    queryString += ' WHERE ';

    COLUMNS.forEach((col, i) => {
      queryString += ` ${col} LIKE ? ${i < COLUMNS.length - 1 ? 'OR' : ''} `;
      queryParams.push(`%${search}%`);
    });
  }

  if (type === 'count') {
    return {
      string: queryString,
      params: queryParams
    };
  }

  if (sortby) {
    queryString += buildQuery$sort(sortby, queryParams);
  }

  // By default, SQL orders by ASC. If the user specifies DESC, order by that instead.
  if (order != null && order.toUpperCase() === 'DESC'){
    queryString += ' DESC ';
  }

  queryString += ` LIMIT ${offset}, ${PAGESIZE} `;
  queryString = queryString.trim();
  queryString = queryString.replace(/ +/g, ' ');

  return {
    string: queryString,
    params: queryParams
  };
}

/**
 * Helper function for `buildQuery` to append a sorting query.
 *
 * @param {string} sortby
 * @param {string[]} queryParams
 * @returns {string}
 */
function buildQuery$sort(sortby, queryParams) {
  // For sorting salaries, we need to parse the salary value into a number
  if (sortby.toLowerCase() === 'salary') {
    return 'ORDER BY CAST(REPLACE(REPLACE(salary,\'$\',\'\'),\',\',\'\') AS UNSIGNED) ';
  } else {
    queryParams.push(sortby);
    // Ignore whitespace while sorting
    return ' ORDER BY REPLACE(??,\' \',\'\') ';
  }
}

/**
 * Sends a response using Express.
 *
 * @param {Express.Response} res The response object.
 * @param {int} status Status code to return.
 * @param {string} message Message to return with code.
 */
function sendResponse(res, status, message) {
  res.status(status).send(message);
}

/**
 * Parses the failed response object from SQL into a meaningful error response.
 *
 * @param {Express.Response} res The response object.
 * @param {object} error Error object from SQL execution.
 */
function handleError (res, error) {
  sendResponse(res, 500, error);
}

/**
 * Runs a SQL query and returns the result, otherwise sends an error.
 *
 * @param {Express.Request} req The original request.
 * @param {Express.Response} res The response object.
 * @param {string} query Query string to pass into SQL.
 * @param {array} params Objects to substitute into the query.
 */
async function runQuery(req, res, query, params) {
  try {
    const results = await db.query(query, params);
    return results;
  } catch (sqlError) {
    logger.error({
      req,
      sqlError
    });
    handleError(res, sqlError);
  }
}

module.exports = router;
