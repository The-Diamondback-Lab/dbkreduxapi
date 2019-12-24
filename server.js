const https = require('https');
const fs = require('fs');
const express = require('express');
const newsRouter = require('./news/app');
const salaryRouter = require('./salary/app');

require('dotenv').config();

const app = express();

app.use(newsRouter);
app.use(salaryRouter);

const port = process.env.PORT || 8080

let keyPath = process.env.PRIVATE_KEY_PATH;
let certPath = process.env.CERTIFICATE_PATH;

let keyData = keyPath ? fs.readFileSync(keyPath) : null;
let certData = certPath ? fs.readFileSync(certPath) : null;

// If private key or certificate weren't present, don't start the server
// underneath HTTPS
if (keyData == null || certData == null) {
  app.listen(port, () => {
    console.log(`App is listening on port ${port}.`)
  });
} else {
  console.log('Certificate loaded');
  // https://stackoverflow.com/a/11805909
  https.createServer({
    key: keyData,
    cert: certData
  }, app).listen(port, () =>
    console.log(`App is listening on port ${port}.`)
  )
}
