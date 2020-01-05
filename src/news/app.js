const express = require('express');
const router = express.Router();
const wp_api = require('../utilities/wordpress-service.js');
const cors = require('cors');
const redis = require('../utilities/redis');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

router.use(cors());

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.get('/', (req, res) => {
  res.redirect('/docs');
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
router.get('/articles', function (req, res){
  let expire = 60;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let articles = req.query.per_page;
      let page = req.query.page;
      let category = req.query.category;
      let author = req.query.author;
      let search = req.query.search;
      let preview = req.query.preview;
      let order = req.query.order;
      let orderby = req.query.orderby;

      wp_api.getArticles(articles, page, category, author, search, preview, order, orderby)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});


/**
 * @api {get} /articles/:articleId Gets a single DBK Article
 * @apiName GetArticle
 * @apiGroup Articles
 *
 * @apiParam  {String} articleId Unique article ID (slug).
 */
router.get('/articles/:articleId', function(req, res){
  let expire = 30;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let articleId = req.params.articleId;
      wp_api.getArticle(articleId)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});


/**
 * @api {get} /featured_article Gets the current homepage featured article
 * @apiName GetFeaturedArticle
 * @apiGroup Articles
 */
router.get('/featured_article', function(req, res){
  let expire = 60;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      wp_api.getFeaturedArticle()
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});


/**
 * @api {get} /menu/:menuId Gets data for a menu
 * @apiName GetMenu
 * @apiGroup Menu
 *
 * @apiParam  {String} menuId Unique menu ID.
 */
router.get('/menu/:id', function (req, res){
  let expire = 300;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let menu_id = req.params.id;
      wp_api.getMenu(menu_id)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});

/**
 * @api {get} /category/:categoryId Gets data for a category
 * @apiName GetCategory
 * @apiGroup Categories
 *
 * @apiParam  {String} categoryId Unique category ID.
 */
router.get('/category/:id', function (req, res){
  let expire = 300;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let category_id = req.params.id;
      wp_api.getCategory(category_id)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});

/**
 * @api {get} /author/:authorId Gets data for an author
 * @apiName GetAuthor
 * @apiGroup Authors
 *
 * @apiParam  {String} authorId Unique author ID.
 */
router.get('/author/:id', function(req, res){
  let expire = 300;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let author_id = req.params.id;
      wp_api.getAuthor(author_id)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});

/**
 * @api {get} /pages Gets a list of DBK pages
 * @apiName GetPages
 * @apiGroup Pages
 *
 * @apiParam  {String} [search] The search term to query pages by.
 *
 */
router.get('/pages', function(req, res){
  let expire = 300;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let search = req.query.search;
      wp_api.getPages(search)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});

/**
 * @api {get} /pages/:pageId Gets data for a page
 * @apiName GetPage
 * @apiGroup Pages
 *
 * @apiParam  {String} pageId Unique page ID.
 */
router.get('/pages/:pageId', function(req, res){
  let expire = 30;
  res.setHeader('Content-Type', 'application/json');
  redis.get(req.originalUrl, (err, reply) => {
    if (reply){
      res.send(reply);
    }
    else{
      let pageId = req.params.pageId;
      wp_api.getPage(pageId)
        .then(data => {
          if (typeof data.response_code === 'undefined'){
            redis.setex(req.originalUrl, expire, JSON.stringify(data));
            res.send(data);
          }
          else { //don't cache non-200 responses
            res.status(data.response_code);
            res.send(data);
          }
        });
    }
  });
});

module.exports = router;
