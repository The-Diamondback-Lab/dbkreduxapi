const fetch = require('node-fetch');
const url = require('url');
const { createLogger } = require('./logger');

const wpUrlSecure = 'https://wp.dbknews.com';
const wpUrlOld = "https://wordpress.dbknews.com";
const wpIp = "http://54.196.232.70";
const wpIpSecure = "https://54.196.232.70";

const allPostsUrl = `${wpUrlSecure}/wp-json/wp/v2/posts?_embed&`;
const featuredPostUrl = `${wpUrlSecure}/wp-json/wp/v2/posts?featured-story=1&per_page=1&_embed`;
const menuUrl = `${wpUrlSecure}/wp-json/wp-api-menus/v2/menus`;
const categoriesUrl = `${wpUrlSecure}/wp-json/wp/v2/categories`;
const usersUrl = `${wpUrlSecure}/wp-json/wp/v2/users`;
const pagesUrl = `${wpUrlSecure}/wp-json/wp/v2/pages`;

const logger = createLogger('dbk-wpapi');

/** FUNCTIONS USED BY APP.JS **/

exports.getArticles = async function (perPage, page, category, author,
  search, preview, order, orderby) {
  const query = sanitizeQuery({
    // eslint-disable-next-line camelcase
    per_page: perPage,
    page,
    search,
    order,
    orderby
  });

  let reqUrl = allPostsUrl + url.format({ query });

  if (typeof category !== 'undefined') {
    try {
      const categoryIds = await getCategoryId(category);

      reqUrl += `categories=${categoryIds}&`;
    } catch (err) {
      return error('invalid_category_name', `Invalid category name '${category}'.`, 400);
    }
  }

  if (typeof author !== 'undefined') {
    try {
      const authorId = await getAuthorId(author);

      reqUrl += `author=${authorId}&`;
    } catch (err) {
      logError(exports.getArticles, err, perPage, page, category, author,
        search, preview, order, orderby);
      return error('invalid_author_id', `Invalid author ID '${author}'.`, 400);
    }
  }

  try {
    const raw = await request(reqUrl);

    return getArticles$Helper0(raw, preview);
  } catch (err) {
    logError(exports.getArticles, err, perPage, page, category, author, search,
      preview, order, orderby);

    return error('get_articles_error', 'Unexpected error', 500);
  }
};

function getArticles$Helper0(raw, preview) {
  if (typeof raw.code !== 'undefined' && raw.code === 'rest_post_invalid_page_number') {
    return error('invalid_page_number', 'Page number is out of range', 400);
  }

  const resp = raw.map(ele => {
    const article = sanitizeArticle(ele);

    // Only return necessary fields if preview flag is enabled, otherwise the full response
    if (preview) {
      return {
        'id': article.id,
        'title': article.title,
        'link': article.link,
        'date': article.date,
        'modified': article.modified,
        'excerpt': article.excerpt.rendered,
        'author': article.author,
        'featured_image': article.featured_image,
        'categories': article.categories
      };
    } else {
      return article;
    }
  });

  return resp;
}

exports.getArticle = async function (articleId) {
  articleId = articleId.trim();

  const reqUrl = `${allPostsUrl}slug=${articleId}`;

  try {
    const raw = await request(reqUrl);
    const article = raw[0];

    return sanitizeArticle(article);
  } catch (err) {
    logError(exports.getArticle, err, articleId);

    return error('article_not_found', `Invalid article ID '${articleId}'.`, 404);
  }
};

exports.getFeaturedArticle = async function () {
  try {
    let article = await request(featuredPostUrl);
    article = sanitizeArticle(article[0]);

    return {
      'id': article.id,
      'title': article.title,
      'link': article.link,
      'date': article.date,
      'modified': article.modified,
      'excerpt': article.excerpt.rendered,
      'author': article.author,
      'featured_image': article.featured_image,
      'categories': article.categories
    };
  } catch (err) {
    logError(exports.getFeaturedArticle, err);

    return error('featured_article_not_found', 'Featured article not found.', 404);
  }
};

exports.getMenu = async function (menuName) {
  try {
    let allMenus = await request(menuUrl);
    allMenus = allMenus.find(menu => menu.name === menuName);

    const reqUrl = (`${menuUrl}/${allMenus.ID}`);
    const menuObj = await request(reqUrl);

    menuObj.items.forEach(
      menuItem => {
        if (menuItem.type !== 'custom') {
          sanitizeMenuUrls(menuItem);
        }
      }
    );

    delete menuObj.meta;

    return menuObj;
  } catch (err) {
    logError(exports.getMenu, err, menuName);

    return error('menu_not_found', `Invalid menu ID '${menuName}'.`, 404);
  }
};

exports.getCategory = async function (categoryName) {
  categoryName = categoryName.trim();

  let reqUrl = `${categoriesUrl}?slug=${categoryName}`;

  try {
    let category = await request(reqUrl);
    category = category[0];

    // Replace parent ID with slug
    if (category.parent === 0) {
      category.parent = null;
    } else {
      reqUrl = `${categoriesUrl}/${category.parent}`;
      const parentCategory = await request(reqUrl);
      category.parent = parentCategory.slug;
    }

    return sanitizeCategory(category);
  } catch (err) {
    logError(exports.getCategory, err, categoryName);

    return error('category_not_found', `Invalid category ID '${categoryName}'.`, 404);
  }
};

exports.getAuthor = async function (authorName) {
  authorName = authorName.trim();

  const reqUrl = `${usersUrl}?slug=${authorName}`;

  try {
    let author = await request(reqUrl);
    author = author[0];

    if (author.user_twitter) {
      // eslint-disable-next-line camelcase
      author.user_twitter = author.user_twitter.replace('@', '');
    }

    delete author._links;
    author.link = sanitizeUrl(author.link);

    return author;
  } catch (err) {
    logError(exports.getAuthor, err, authorName);

    return error('author_not_found', `Invalid author ID '${authorName}'.`, 404);
  }
};

exports.getPages = async function (search) {
  if (typeof search === 'undefined') {
    search = '';
  }

  const reqUrl = `${pagesUrl}?search=${search}`;

  try {
    let pages = await request(reqUrl);

    pages = pages.map(page => sanitizePage(page));

    return pages;
  } catch (err) {
    logError(exports.getPages, err, search);

    return error('pages_bad_request', 'Invalid request for pages.', 400);
  }
};

exports.getPage = async function (pageName) {
  const reqUrl = `${pagesUrl}?slug=${pageName}`;

  try {
    const pages = await request(reqUrl);

    return sanitizePage(pages[0]);
  } catch (err) {
    logError(exports.getPage, err, pageName);

    return error('page_not_found', `Invalid page ID '${pageName}'.`, 404);
  }
};


/** HELPER FUNCTIONS **/

async function request(reqUrl) {
  const response = await fetch(reqUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });

  return response == null ? null : response.json();
}

// eslint-disable-next-line camelcase
function error(code, message, response_code) {
  return {
    code,
    message,
    // eslint-disable-next-line camelcase
    response_code
  };
}

/**
 * Logs an error given the function where it originated from, an error, and
 * any arguments for that function.
 *
 * @param {Function} func Function where error originated from
 * @param {object} err The error thrown
 * @param  {...any} args Arguments that the function was invoked with
 */
function logError(func, err, ...args) {
  logger.error({
    call: {
      name: func.name,
      args
    },
    err
  });
}

function sanitizeQuery(query) {
  const newQuery = {};

  for (const k in query) {
    if (query[k] != null) {
      newQuery[k] = query[k];
    }
  }

  return newQuery;
}

function sanitizeCategory(category) {
  category.id = category.slug;

  category.link = sanitizeUrl(category.link);

  delete category.slug;
  delete category._links;

  return category;
}

function sanitizeArticle(article) {
  // Replace numerical id with slug
  article.id = article.slug;
  delete article.slug;

  article.title = article.title.rendered;

  // Retrieve author object
  article.author = article._embedded.author[0];
  article.author.link = sanitizeUrl(article.author.link);

  if (article.author.user_twitter){
    // eslint-disable-next-line camelcase
    article.author.user_twitter = article.author.user_twitter.trim().replace('@', '');
  }

  delete article.author._links;

  // Extract featured image link and caption
  if (typeof article._embedded['wp:featuredmedia'] !== 'undefined') {
    extractFeaturedImageData(article);
  }

  // Retrieve categories and extract id, name and link
  article.categories = article._embedded['wp:term'][0];
  article.categories = article.categories.map(cat => {
    cat.link = sanitizeUrl(cat.link);

    return {
      id: cat.slug,
      name: cat.name,
      link: cat.link
    };
  });

  // Replace link
  article.link = sanitizeUrl(article.link);

  // Delete unnecessary fields
  delete article.featured_media;
  delete article._embedded;
  delete article._links;
  delete article.guid;

  return article;
}

function extractFeaturedImageData(article) {
  const featuredMediaObj = article._embedded['wp:featuredmedia'];
  let sizes = '';
  let caption = '';

  if (featuredMediaObj.sizes) {
    sizes = article._embedded['wp:featuredmedia'][0].media_details.sizes;
  }

  if (featuredMediaObj[0].caption) {
    caption = article._embedded['wp:featuredmedia'][0].caption.rendered;
  }

  const fallbackUrl = article._embedded['wp:featuredmedia'][0].source_url;

  if (!sizes) {
    // eslint-disable-next-line camelcase
    article.featured_image = {
      url: fallbackUrl,
      caption,
      article: fallbackUrl,
      preview: fallbackUrl
    };
  } else {
    // eslint-disable-next-line camelcase
    article.featured_image = {
      url: sizes.full.source_url,
      caption,
      article: (sizes.large ? sizes.large.source_url : sizes.full.source_url),
      preview: (sizes.medium ? sizes.medium.source_url : sizes.full.source_url)
    };
  }
}

function sanitizePage(page) {
  page.id = page.slug;
  page.title = page.title.rendered;

  page.link = sanitizeUrl(page.link);

  // Delete unnecessary fields
  delete page.featured_media;
  delete page._embedded;
  delete page._links;
  delete page.guid;

  return page;
}

function sanitizeUrl(link) {
  const targets = [
    wpUrlSecure,
    wpUrlOld,
    wpIp,
    wpIpSecure
  ];

  targets.forEach(target => {
    if (link.indexOf(target) >= 0) {
      link = link.replace(target, '');

      logger.debug(`sanitizeUrl Replaced ${target}`);
    }
  });

  return link;
}

function sanitizeMenuUrls(menuItem) {
  menuItem.url = sanitizeUrl(menuItem.url);

  if (menuItem.children) {
    menuItem.children.forEach(child => {
      if (menuItem.type !== 'custom') {
        sanitizeMenuUrls(child);
      }
    });
  }
}

/**
 * Based on a category slug, return all category IDs that are in that category's hiearchy
 */
async function getCategoryId(slug) {
  const reqUrl = `${categoriesUrl}?slug=${slug}`;
  const categoryResp = await request(reqUrl);
  const root = categoryResp[0].id;
  const cats = [];

  await getAllCategoryIds(root, cats);

  return cats;
}


async function getAllCategoryIds(id, cats) {
  const reqUrl = `${categoriesUrl}?parent=${id}`;
  const categoryObj = await request(reqUrl);

  cats.push(id);
  categoryObj.forEach(c => getAllCategoryIds(c.id, cats));
}

async function getAuthorId(slug) {
  const reqUrl = `${usersUrl}?slug=${slug}`;
  const usersObj = await request(reqUrl);

  if (usersObj.length === 0) {
    throw Error('users object is empty');
  } else {
    return usersObj[0].id;
  }
}
