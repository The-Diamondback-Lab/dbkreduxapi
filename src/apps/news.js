const express = require('express');
const cors = require('cors');
const { createLogger } = require('../utilities/logger');

const logger = createLogger('dbk-news', process.env.LOG_LEVEL);
const wpApi = require('../utilities/wordpress-service.js');
const redis = require('../utilities/redis');

const EXPIRE = {
  ARTICLE_LIST: 60,
  ARTICLE_SINGLE: 30,
  ARTICLE_FEATURED: 60,
  ARTICLE_BANNER: 150,
  MENU_SINGLE: 300,
  CATEGORY_SINGLE: 300,
  AUTHOR_SINGLE: 300,
  PAGE_LIST: 300,
  PAGE_SINGLE: 30
};

// eslint-disable-next-line new-cap
const router = express.Router();

router.use(cors());

// Each response is JSON
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Redis middleware handler
router.use((req, res, next) => {
  redis.get(req.originalUrl, (err, reply) => {
    if (err) {
      handleRedisError(req, res, err);
    } else if (reply) {
      res.send(reply);
    } else {
      next();
    }
  });
});

/**
 * Sends a 500 status code and logs the request and error
 * object.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {RedisError} redisError
 */
function handleRedisError(req, res, redisError) {
  res.status(500).send({
    name: redisError.name,
    message: redisError.message
  });

  logger.error({
    redisError,
    req
  });
}

/**
 * Returns a function that takes in a response object from the included WordPress service.
 * The response result is cached if and only if the response code is 200.
 *
 * @param {Express.Request} req The original request
 * @param {Express.Response} res
 * @param {number} expireValue How long the result should be cached in Redis (in seconds)
 */
function handleWpResult(req, res, expireValue) {
  return wpResponse => {
    // Only cache successful responses
    // Undefined response code is the same as 200
    if (typeof wpResponse.response_code === 'undefined') {
      redis.setex(req.originalUrl, expireValue, JSON.stringify(wpResponse));
    } else {
      logger.warn({
        req,
        wpResponse
      });
      res.status(wpResponse.response_code);
    }

    res.send(wpResponse);
  };
}

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
 */
router.get('/articles', (req, res) => {
  const articles = req.query.per_page;
  const { page } = req.query;
  const { category } = req.query;
  const { author } = req.query;
  const { search } = req.query;
  const { preview } = req.query;
  const { order } = req.query;
  const { orderby } = req.query;

  wpApi.getArticles(articles, page, category, author, search, preview, order, orderby)
    .then(handleWpResult(req, res, EXPIRE.ARTICLE_LIST));
});

/**
 * @api {get} /articles/:articleId Gets a single DBK Article
 * @apiName GetArticle
 * @apiGroup Articles
 *
 * @apiParam  {String} articleId Unique article ID (slug).
 */
router.get('/articles/:articleId', (req, res) => {
  const { articleId } = req.params;

  wpApi.getArticle(articleId)
    .then(handleWpResult(req, res, EXPIRE.ARTICLE_SINGLE));
});

/**
 * @api {get} /featured_article Gets the current homepage featured article
 * @apiName GetFeaturedArticle
 * @apiGroup Articles
 */
router.get('/featured_article', (req, res) => {
  wpApi.getFeaturedArticle()
    .then(handleWpResult(req, res, EXPIRE.ARTICLE_FEATURED));
});

router.get('/banner_article', (req, res) => {
  wpApi.getBannerArticle()
    .then(handleWpResult(req, res, EXPIRE.ARTICLE_BANNER));
});

/**
 * @api {get} /menu/:menuId Gets data for a menu
 * @apiName GetMenu
 * @apiGroup Menu
 *
 * @apiParam  {String} menuId Unique menu ID.
 */
router.get('/menu/:id', (req, res) => {
  const menuId = req.params.id;

  wpApi.getMenu(menuId)
    .then(handleWpResult(req, res, EXPIRE.MENU_SINGLE));
});

/**
 * @api {get} /category/:categoryId Gets data for a category
 * @apiName GetCategory
 * @apiGroup Categories
 *
 * @apiParam  {String} categoryId Unique category ID.
 */
router.get('/category/:id', (req, res) => {
  const categoryId = req.params.id;

  wpApi.getCategory(categoryId)
    .then(handleWpResult(req, res, EXPIRE.CATEGORY_SINGLE));
});

/**
 * @api {get} /author/:authorId Gets data for an author
 * @apiName GetAuthor
 * @apiGroup Authors
 *
 * @apiParam  {String} authorId Unique author ID.
 */
router.get('/author/:id', (req, res) => {
  const authorId = req.params.id;

  wpApi.getAuthor(authorId)
    .then(handleWpResult(req, res, EXPIRE.AUTHOR_SINGLE));
});

/**
 * @api {get} /pages Gets a list of DBK pages
 * @apiName GetPages
 * @apiGroup Pages
 *
 * @apiParam  {String} [search] The search term to query pages by.
 *
 */
router.get('/pages', (req, res) => {
  const { search } = req.query;

  wpApi.getPages(search)
    .then(handleWpResult(req, res, EXPIRE.PAGE_LIST));
});

/**
 * @api {get} /pages/:pageId Gets data for a page
 * @apiName GetPage
 * @apiGroup Pages
 *
 * @apiParam  {String} pageId Unique page ID.
 */
router.get('/pages/:pageId', (req, res) => {
  const { pageId } = req.params;

  wpApi.getPage(pageId)
    .then(handleWpResult(req, res, EXPIRE.PAGE_SINGLE));
});

module.exports = router;
