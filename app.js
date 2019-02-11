const express = require('express');
const app = express();
const wp_api = require('./wordpress-service.js');
const cors = require('cors');
const sls = require('serverless-http')

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
 * @apiParam  {Number} [per_page] The number of articles to retrieve per page.
 * @apiParam  {Number} [page] The page of articles to retrieve.
 * @apiParam  {String} [category] The category ID (slug) from which to retrieve articles. 
 * @apiParam  {String} [author] The author ID (slug) from which to retrieve articles. 
 * @apiParam  {String} [search] The search term to query articles by.
 * @apiParam  {String} [order] Order of the results. [author, date, modified, relevance, title]
 * @apiParam  {String} [orderby] How to order the results. [asc, desc]

 * 
 */
app.get('/articles', function (req, res){
  let articles = req.query.per_page;
  let page = req.query.page;
  let category = req.query.category;
  let author = req.query.author;
  let search = req.query.search;
  let preview = req.query.preview;
  let order = req.query.order;
  let orderby = req.query.orderby;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getArticles(articles, page, category, author, search, preview, order, orderby)
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
 * @api {get} /featured_article Gets the current homepage featured article
 * @apiName GetFeaturedArticle
 * @apiGroup Articles
 */
app.get('/featured_article', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  wp_api.getFeaturedArticle()
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

/**
 * @api {get} /author/:authorId Gets data for an author
 * @apiName GetAuthor
 * @apiGroup Authors
 * 
 * @apiParam  {String} authorId Unique author ID.
 */
app.get('/author/:id', function(req, res){
  let author_id = req.params.id;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getAuthor(author_id)
  .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});

/**
 * @api {get} /pages Gets a list of DBK pages
 * @apiName GetPages
 * @apiGroup Pages
 *
 * @apiParam  {String} [search] The search term to query pages by.
 * 
 */
app.get('/pages', function(req, res){
  let search = req.query.search;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getPages(search)
  .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});

/**
 * @api {get} /pages/:pageId Gets data for a page
 * @apiName GetPage
 * @apiGroup Pages
 * 
 * @apiParam  {String} pageId Unique page ID.
 */
app.get('/pages/:pageId', function(req, res){
  let pageId = req.params.pageId;

  res.setHeader('Content-Type', 'application/json');
  wp_api.getPage(pageId)
  .then(data => typeof data.response_code === 'undefined' ? (res.send(data)) : (res.status(data.response_code), res.send(data)));
});

app.get('/ads', function (req, res){

});



// app.listen(process.env.PORT || 8080);
// module.exports = app;
module.exports.server = sls(app);

