const https = require('https');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const baseRouter = require('./apps/base');
const newsRouter = require('./apps/news');
const salaryRouter = require('./apps/salary');

require('dotenv').config();

const app = express();

app.use(compression());
app.use(baseRouter);
app.use(newsRouter);
app.use(salaryRouter);

const port = process.env.PORT || 8080;

const keyPath = process.env.PRIVATE_KEY_PATH;
const certPath = process.env.CERTIFICATE_PATH;

const keyData = keyPath ? fs.readFileSync(keyPath) : null;
const certData = certPath ? fs.readFileSync(certPath) : null;

// If private key or certificate weren't present, don't start the server
// underneath HTTPS
if (keyData == null || certData == null) {
  console.log('Not using a certificate');
  app.listen(port, () => {
    console.log(`App is listening on port ${port}.`);
  });
} else {
  console.log('Certificate loaded');
  // https://stackoverflow.com/a/11805909
  https.createServer({
    key: keyData,
    cert: certData
  }, app).listen(port, () => console.log(`App is listening on port ${port}.`)
  );
}
