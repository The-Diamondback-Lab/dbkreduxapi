const express = require('express');
const newsRouter = require('./news/app');

const app = express();

app.use(newsRouter);

const port = process.env.PORT || 8080

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
)