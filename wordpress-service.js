const fetch = require('node-fetch');

const wp_url = "http://52.207.216.69";
const all_posts_url = "http://52.207.216.69/wp-json/wp/v2/posts";
const menu_url = "http://52.207.216.69/wp-json/wp-api-menus/v2/menus/";
const categories_url = "http://52.207.216.69/wp-json/wp/v2/categories";

exports.getArticles = async function (limitArticles, page, category, prev) {
  var url = all_posts_url + "?";
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

  const promises = raw.map(async (ele) => {
    author = await getAuthorName(ele['_links']['author'][0].href); //fetch author name from WP endpoint

    featuredImage = {};
    if (typeof ele['_links']['wp:featuredmedia'] != 'undefined') {
      featuredImage = await getFeaturedImage(ele['_links']['wp:featuredmedia'][0].href); //fetch featured image URL
      featuredImage = {
        "url": featuredImage.guid.rendered,
        "caption": featuredImage.caption.rendered
      };
    }

    const slug_categories = await categoryIdsToSlugs(ele.categories);
    ele.categories = slug_categories;

    if (preview) { //return only necessary fields if preview flag is enabled 
      return {
        "id": ele.id,
        "title": ele.title.rendered,
        "link": ele.link,
        "date": ele.modified,
        "excerpt": ele.excerpt.rendered,
        "author": author,
        "featured-image": featuredImage,
        "categories": ele.categories
      }
    } else { //return full response with author name and featured image URL
      ele["author"] = author;
      ele["featured-image"] = featuredImage;
      delete ele["_links"];
      return ele;
    }
  });
  return Promise.all(promises);
}

exports.getArticle = function (articleId) {
  articleId = articleId.trim();
  url = all_posts_url + "?slug=" + articleId;
  return fetch(url)
    .then(data => data.json())
    .then(resp => {
      if (resp.length === 0){
        return {
          code: "article_not_found",
          message: "Article ID not found.",
          response_code: 404
        };
      }
      else{
        return resp[0];
      }
    });
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