const fetch = require('node-fetch');

const wp_url = "http://52.207.216.69";
const all_posts_url = "http://52.207.216.69/wp-json/wp/v2/posts?_embed&";
const menu_url = "http://52.207.216.69/wp-json/wp-api-menus/v2/menus/";
const categories_url = "http://52.207.216.69/wp-json/wp/v2/categories";

exports.getArticles = async function (limitArticles, page, category, prev) {
  var url = all_posts_url;
  preview = false;
  if (typeof limitArticles != 'undefined') {
    url += "per_page=" + limitArticles + "&";
  }
  if (typeof page != 'undefined') {
    url += "page=" + page + "&";
  }
  if (typeof category != 'undefined') {
    try{
      categoryId = await getCategoryId(category);
      url += "categories=" + categoryId;  
    }
    catch (err) {
      return {
        code: "invalid_category_name",
        message: "Invalid category name.",
        response_code: 404
      };
    }
  }
  if (typeof prev != 'undefined') {
    preview = (prev === "true");
  }

  const rawResp = await fetch(url);
  const raw = await rawResp.json();
  const resp = raw.map( (ele) => {
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

  const rawResp = await fetch(url);
  const raw = await rawResp.json();
  var article = raw[0];

  return sanitizeArticle(article);
}

exports.getMenu = function (menuName) {
  return fetch(menu_url)
    .then(data => data.json())
    .then(allMenus => allMenus.find(menu => menu.name === menuName))
    .then(menu => menu.term_id)
    .then(wp_menu_id => (menu_url + wp_menu_id))
    .then(url => fetch(url))
    .then(data => data.json())
    .then(menuObj => {
      menuObj.items.forEach(
        menuItem => {
          if (menuItem.type !== 'custom'){
            replaceMenuUrl(menuItem);
          }
        }
      );
      return menuObj;
    })
    .catch(e => JSON.stringify({
      code: "menu_not_found",
      message: "Invalid menu ID.",
      response_code: 404
      
  }));
}

function sanitizeArticle(article) {
  //replace numerical id with slug
  article.id = article.slug;
  delete article.slug;

  article.title = article.title.rendered;

   //retrieve author object 
  article.author = article._embedded.author[0];
  delete article.author._links; 

  //extract featured image link and caption
  if (typeof article._embedded["wp:featuredmedia"] != 'undefined'){
    article.featured_image = {
      url: article._embedded["wp:featuredmedia"][0].media_details.sizes.full.source_url,
      caption: article._embedded["wp:featuredmedia"][0].caption.rendered
    }
  }

  //retrieve categories and extract id, name and link
  article.categories = article._embedded["wp:term"][0];
  article.categories = article.categories.map(cat => { 
  return { 
    id: cat.slug,
    name: cat.name,
    link: cat.link
  }});

  //delete unnecessary fields
  delete article.featured_media;
  delete article._embedded;
  delete article._links;
  return article;
}

function replaceMenuUrl(menuItem){
  menuItem.url = menuItem.url.replace(wp_url, "");
  if (menuItem.children){
    menuItem.children.forEach(child => { 
      if (menuItem.type !== 'custom'){
        replaceMenuUrl(child);
      }
    });
  }
}

async function getFeaturedImage(url) {
  const featuredImageResp = await fetch(url);
  const featImageJson = await featuredImageResp.json();
  return featImageJson;
}

async function getAuthorName(url) {
  const authorResp = await fetch(url);
  const author = await authorResp.json();
  return {
    "id": author.id,
    "name": author.name,
    "link": author.link
    };
}

async function getCategoryId(slug){
  const req_url = categories_url + "?slug="+slug;
  const categoryResp = await fetch(req_url);
  const categoryObj = await categoryResp.json();
  return categoryObj[0].id;
}

async function getCategorySlug(id){
  const req_url = categories_url + "/"+id;
  const categoryResp = await fetch(req_url);
  const categoryObj = await categoryResp.json();
  return categoryObj.slug;
}

async function categoryIdsToSlugs(categoryIds) {
  const slug_categories = categoryIds.map(async (categoryId) => {
    const slug = await getCategorySlug(categoryId);
    return slug;
  });
  return Promise.all(slug_categories);
}