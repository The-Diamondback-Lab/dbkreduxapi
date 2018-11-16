const express = require('express');
const app = express();
const wp_api = require('./wordpress-service.js');

app.get('/', function(req, res){
  res.send("Welcome to the DBK API!");
});

app.get('/articles', function (req, res) {
  let articles = req.query.per_page;
  let page = req.query.page;
  let category = req.query.category;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticles(articles, page, category)
    .then(data => res.send(data))
});

app.get('/articles/:articleId', function(req, res){
  let articleId = req.params.articleId;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticle(articleId)
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
