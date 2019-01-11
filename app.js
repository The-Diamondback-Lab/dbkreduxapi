const express = require('express');
const app = express();
const wp_api = require('./wordpress-service.js');
const cors = require('cors');

app.use(cors({credentials: true, origin: true}));
app.use('/', express.static(__dirname + '/doc'));

app.get('/', function(req, res){
  res.sendFile( __dirname + "/doc/index.html");
});


/**
 * @api {get} /articles?preview={boolean} Gets a list of DBK articles
 * @apiName GetArticles
 * @apiGroup Articles
 *
 * @apiParam  {Boolean} preview Whether to retrieve full article data or just preview data.
 * @apiParam  {Number} [per_page]  The number of articles to retrieve per page.
 * @apiParam  {Number} [page] The page of articles to retrieve.
 * @apiParam  {Number} [category] The category ID (slug) from which to retrieve articles. 
 * 
 */
app.get('/articles', function (req, res) {
  let articles = req.query.per_page;
  let page = req.query.page;
  let category = req.query.category;
  let preview = req.query.preview;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticles(articles, page, category, preview)
    .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});


/**
 * @api {get} /articles/:articleId Gets a single DBK Article
 * @apiName GetArticle
 * @apiGroup Articles
 *
 * @apiParam  {String} articleId Unique article ID (slug).
 */
app.get('/articles/:articleId', function(req, res){
  let articleId = req.params.articleId;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticle(articleId)
    .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});


/**
 * @api {get} /menu/:menuId Gets data for a menu
 * @apiName GetMenu
 * @apiGroup Menu
 *
 * @apiParam  {String} menuId Unique menu ID.
 */
app.get('/menu/:id', function (req, res){
  let menu_id = req.params.id;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getMenu(menu_id)
    .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});

/**
 * @api {get} /category/:categoryId Gets data for a category
 * @apiName GetCategory
 * @apiGroup Categories
 * 
 * @apiParam  {String} categoryId Unique category ID.
 */
app.get('/category/:id', function (req, res){
  let category_id = req.params.id;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getCategory(category_id)
    .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});


app.get('/ads', function (req, res){

});


// app.listen(process.env.PORT || 8080);
module.exports = app;
