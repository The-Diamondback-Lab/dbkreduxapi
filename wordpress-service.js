const fetch = require('node-fetch');

const all_posts_url = "http://52.207.216.69/wp-json/wp/v2/posts";
const menu_url = "http://52.207.216.69/wp-json/wp-api-menus/v2/menus/"

exports.getArticles = async function (limitArticles, page, category, prev) {
  url = all_posts_url + "?";
  preview = false;
  if (typeof limitArticles != 'undefined') {
    url += "per_page=" + limitArticles + "&";
  }
  if (typeof page != 'undefined') {
    url += "page=" + page + "&";
  }
  if (typeof category != 'undefined') {
    url += "categories=" + category;
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
    if (preview) { //return only necessary fields if preview flag is enabled 
      return {
        "id": ele.id,
        "title": ele.title.rendered,
        "link": ele.link,
        "date": ele.modified,
        "excerpt": ele.excerpt.rendered,
        "author": author,
        "featured-image": featuredImage
      }
    } else { //return full response with author name and featured image URL
      ele["author"] = author;
      ele["featured-image"] = featuredImage;
      return ele;
    }
  });
  return Promise.all(promises);
}

exports.getArticle = function (articleId) {
  url = all_posts_url + "/" + articleId;
  return fetch(url)
    .then(data => data.json());
}

exports.getMenu = function (menuName) {
  return fetch(menu_url)
    .then(data => data.json())
    .then(allMenus => allMenus.find(menu => menu.name === menuName))
    .then(menu => menu.term_id)
    .then(wp_menu_id => (menu_url + wp_menu_id))
    .then(url => fetch(url))
    .then(data => data.json())
    .catch(e => JSON.stringify({
      error: "Menu not found"
    }));
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