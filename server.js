const express = require('express');
const newsRouter = require('./news/app');
const salaryRouter = require('./salary/app');

const app = express();

app.use(newsRouter);
app.use(salaryRouter);

const port = process.env.PORT || 8080

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
)