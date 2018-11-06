const express = require('express');
const app = express();
const wp_api = require('./wordpress-service.js');

app.get('/', function(req, res){
  res.send("Welcome to the DBK API!");
});

app.get('/posts', function (req, res) {
  let posts = req.query.per_page;
  let page = req.query.page;
  let category = req.query.category;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getPosts(posts, page, category)
    .then(data => res.send(data))
});

app.get('/menu/:id', function (req, res){
  let menu_id = req.params.id;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getMenu(menu_id)
  .then(data => res.send(data))
});


app.get('/ads', function (req, res){

});


app.listen(process.env.PORT || 8080);
