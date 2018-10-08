const express = require('express');
const app = express();
const wp_api = require('./wordpress-service.js');

app.get('/posts', function (req, res) {
  let category = req.query.category;
  let posts = req.query.limit;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getPosts(posts, category)
       .then(data => res.send(data))
});


app.listen(process.env.PORT || 8080);
