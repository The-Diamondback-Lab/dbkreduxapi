const fetch = require('node-fetch');

const wp_url = "http://54.196.232.70";
const replace_wp_url = "http://wordpress.dbknews.com";

const all_posts_url = `${wp_url}/wp-json/wp/v2/posts?_embed&`;
const featured_post_url = `${wp_url}/wp-json/wp/v2/posts?featured-story=1&per_page=1&_embed`;
const menu_url = `${wp_url}/wp-json/wp-api-menus/v2/menus`;
const categories_url = `${wp_url}/wp-json/wp/v2/categories`;
const users_url = `${wp_url}/wp-json/wp/v2/users`;
const pages_url = `${wp_url}/wp-json/wp/v2/pages`;

/** FUNCTIONS USED BY APP.JS **/

exports.getArticles = async function (limitArticles, page, category, author, search, prev, order, orderby) {
  var url = all_posts_url;
  preview = false;
  if (typeof limitArticles !== 'undefined') {
    url += "per_page=" + limitArticles + "&";
  }
  if (typeof page !== 'undefined') {
    url += "page=" + page + "&";
  }
  if (typeof category !== 'undefined') {
    try {
      categoryIds = await getCategoryId(category);
      url += "categories=" + categoryIds + "&";
    } catch (err) {
      return error("invalid_category_name", `Invalid category name '${category}'.`, 400);
    }
  }
  if (typeof author !== 'undefined') {
    try {
      authorId = await getAuthorId(author);
      url += "author=" + authorId + "&";
    } catch (err) {
      return error("invalid_author_id", `Invalid author ID '${author}'.`, 400);
    }
  }
  if (typeof search !== 'undefined') {
    url += "search=" + search + "&";
  }
  if (typeof order !== 'undefined') {
    url += "order=" + order + "&";
  }
  if (typeof orderby != 'undefined') {
    url += "orderby=" + orderby
  }
  if (typeof prev != 'undefined') {
    preview = (prev === "true");
  }

  const raw = await request(url);

  if (typeof raw.code !== 'undefined' && raw.code === 'rest_post_invalid_page_number') {
    return error("invalid_page_number", "Page number is out of range", 400); 
  }
  const resp = raw.map((ele) => {
    var article = sanitizeArticle(ele);
    if (preview) { //return only necessary fields if preview flag is enabled 
      return {
        "id": article.id,
        "title": article.title,
        "link": article.link,
        "date": article.date,
        "modified": article.modified,
        "excerpt": article.excerpt.rendered,
        "author": article.author,
        "featured_image": article.featured_image,
        "categories": article.categories
      }
    } else { //return full response
      return article;
    }
  });
  return resp;
}

exports.getArticle = async function (articleId) {
  articleId = articleId.trim();
  url = all_posts_url + "slug=" + articleId;

  try {
    const raw = await request(url);
    var article = raw[0];
    return sanitizeArticle(article);
  } catch (err) {
    return error("article_not_found", `Invalid article ID '${articleId}'.`, 404);
  }
}

exports.getFeaturedArticle = async function () {
  try {
    var article = await request(featured_post_url);
    article = sanitizeArticle(article[0]);
    return {
      "id": article.id,
      "title": article.title,
      "link": article.link,
      "date": article.date,
      "modified": article.modified,
      "excerpt": article.excerpt.rendered,
      "author": article.author,
      "featured_image": article.featured_image,
      "categories": article.categories
    };
  }
  catch (err) {
    return error("featured_article_not_found", "Featured article not found.", 404);
  }
}

exports.getMenu = async function (menuName) {
  try {
    var allMenus = await request(menu_url);
    allMenus = allMenus.find(menu => menu.name === menuName);
    var url = (menu_url + '/' + allMenus.ID);
    var menuObj = await request(url);
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
    return error("menu_not_found", `Invalid menu ID '${menuName}'.`, 404);
  }
}

exports.getCategory = async function (categoryName) {
  categoryName = categoryName.trim();
  var url = categories_url + "?slug=" + categoryName;

  try {
    var category = await request(url);
    category = category[0];

    //replace parent ID with slug
    if (category.parent === 0) {
      category.parent = null;
    } else {
      url = categories_url + "/" + category.parent;
      const parentCategory = await request(url);
      category.parent = parentCategory.slug;
    }
    return sanitizeCategory(category);
  } catch (err) {
    return error("category_not_found", `Invalid category ID '${categoryName}'.`, 404);
  }
}

exports.getAuthor = async function (authorName) {
  authorName = authorName.trim();
  var url = users_url + "?slug=" + authorName;

  try {
    var author = await request(url);
    author = author[0];
    if (author.user_twitter) {
      author.user_twitter = author.user_twitter.replace('@', '');
    }
    delete author._links;
    author = replaceUrl(author);
    return author;
  } catch (err) {
    return error("author_not_found", `Invalid author ID '${authorName}'.`, 404);
  }
}

exports.getPages = async function (search) {
  if (typeof search === 'undefined') {
    search = "";
  }
  var url = pages_url + "?search=" + search;
  try {
    var pages = await request(url);
    pages = pages.map((page) => sanitizePage(page));
    return pages;
  } catch (err) {
    return error("pages_bad_request", "Invalid request for pages.", 400);
  }
}

exports.getPage = async function (pageName) {
  var url = pages_url + "?slug=" + pageName;
  try {
    var pages = await request(url);
    return sanitizePage(pages[0]);
  } catch (err) {
    return error("page_not_found", `Invalid page ID '${pageName}'.`, 404);
  };
}


/** HELPER FUNCTIONS **/

async function request(url) {
  var raw = await fetch(url);
  return await raw.json();
}

function error(code, message, response_code) {
  return {
    code: code,
    message: message,
    response_code: response_code
  };
}

function sanitizeCategory(category) {
  category.id = category.slug;

  category = replaceUrl(category);

  delete category.slug;
  delete category._links;

  return category;
}

function sanitizeArticle(article) {
  //replace numerical id with slug
  article.id = article.slug;
  delete article.slug;

  article.title = article.title.rendered;

  //retrieve author object 
  article.author = article._embedded.author[0];
  article.author = replaceUrl(article.author);
  if (article.author.user_twitter){
    article.author.user_twitter = article.author.user_twitter.trim();
    article.author.user_twitter = article.author.user_twitter.replace('@', '');
  }
  delete article.author._links;

  //extract featured image link and caption
  if (typeof article._embedded["wp:featuredmedia"] != 'undefined') {
    let sizes = article._embedded["wp:featuredmedia"][0].media_details.sizes;
    article.featured_image = {
      url: sizes.full.source_url,
      caption: article._embedded["wp:featuredmedia"][0].caption.rendered,
      article: (sizes.large ? sizes.large.source_url : sizes.full.source_url),
      preview: (sizes.medium ? sizes.medium.source_url : sizes.full.source_url)
    };
  }

  //retrieve categories and extract id, name and link
  article.categories = article._embedded["wp:term"][0];
  article.categories = article.categories.map(cat => {
    cat = replaceUrl(cat);
    return {
      id: cat.slug,
      name: cat.name,
      link: cat.link
    }
  });

  //replace link
  article = replaceUrl(article);

  //delete unnecessary fields
  delete article.featured_media;
  delete article._embedded;
  delete article._links;
  delete article.guid;
  return article;
}

function sanitizePage(page) {
  page.id = page.slug;
  page.title = page.title.rendered;

  page = replaceUrl(page);

  //delete unnecessary fields
  delete page.featured_media;
  delete page._embedded;
  delete page._links;
  delete page.guid;

  return page;
}

function sanitizeMenuUrls(menuItem) {
  menuItem.url = menuItem.url.replace(replace_wp_url, "");
  if (menuItem.children) {
    menuItem.children.forEach(child => {
      if (menuItem.type !== 'custom') {
        sanitizeMenuUrls(child);
      }
    });
  }
}

function replaceUrl(input) {
  if (!input.link) {
    return;
  }
  input.link = input.link.replace(replace_wp_url, "");
  return input;
}

async function getFeaturedImage(url) {
  const featImageJson = await request(url);
  return featImageJson;
}

async function getAuthorName(url) {
  const author = await request(url);
  return {
    "id": author.id,
    "name": author.name,
    "link": author.link
  };
}

/*
  Based on a category slug, return all category IDs that are in that category's hiearchy
*/
async function getCategoryId(slug) {
  const req_url = categories_url + "?slug=" + slug;
  const categoryResp = await fetch(req_url);
  const categoryObj = await categoryResp.json();
  var root = categoryObj[0].id;
  var cats = [];
  await getAllCategoryIds(root, cats);
  return cats;
}


async function getAllCategoryIds(id, cats) {
  cats.push(id);
  const req_url = categories_url + "?parent=" + id;
  const categoryObj = await request(req_url);
  categoryObj.forEach(c => getAllCategoryIds(c.id, cats));
}

async function getCategorySlug(id) {
  const req_url = categories_url + "/" + id;
  const categoryObj = await request(req_url);
  return categoryObj.slug;
}

async function categoryIdsToSlugs(categoryIds) {
  const slug_categories = categoryIds.map(async (categoryId) => {
    const slug = await getCategorySlug(categoryId);
    return slug;
  });
  return Promise.all(slug_categories);
}

async function getAuthorId(slug) {
  const req_url = users_url + "?slug=" + slug;
  const usersObj = await request(req_url);
  if (usersObj.length === 0) {
    throw Error('users object is empty');
  }
  return usersObj[0].id;
}