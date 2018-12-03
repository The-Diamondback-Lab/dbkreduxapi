const express = require('express');
const app = express();
const wp_api = require('./wordpress-service.js');
const cors = require('cors');

app.use(cors({credentials: true, origin: true}));

app.get('/', function(req, res){
  res.send("Welcome to the DBK API!");
});


/**
 * @api {get} /articles?preview={boolean} Gets a list of DBK articles
 * @apiName GetArticles
 * @apiGroup Articles
 *
 * @apiParam  {Boolean} preview Whether to retrieve full article data or just preview data.
 * @apiParam  {Number} [per_page]  The number of articles to retrieve per page.
 * @apiParam  {Number} [page] The page of articles to retrieve.
 * @apiParam  {Number} [category] The category ID from which to retrieve articles.
 * 
 */
app.get('/articles', function (req, res) {
  let articles = req.query.per_page;
  let page = req.query.page;
  let category = req.query.category;
  let preview = req.query.preview;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticles(articles, page, category, preview)
    .then(data => res.send(data))
});


/**
 * @api {get} /articles/:articleId Gets a single DBK Article
 * @apiName GetArticle
 * @apiGroup Articles
 *
 * @apiParam  {Number} articleId Unique article ID.
 */
app.get('/articles/:articleId', function(req, res){
  let articleId = req.params.articleId;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticle(articleId)
    .then(data => res.send(data))
});

/**
 * @api {get} /menu/:menuId Gets data for a menu
 * @apiName GetMenu
 * @apiGroup Menu
 *
 * @apiParam  {Number} menuId Unique Menu ID.
 */
app.get('/menu/:id', function (req, res){
  let menu_id = req.params.id;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getMenu(menu_id)
  .then(data => res.send(data))
});


app.get('/ads', function (req, res){

});


app.listen(process.env.PORT || 8080);
