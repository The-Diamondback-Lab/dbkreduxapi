const fetch = require('node-fetch');

const all_posts_url = "http://52.207.216.69/wp-json/wp/v2/posts";
const menu_url = "http://52.207.216.69/wp-json/wp-api-menus/v2/menus/"

exports.getPosts = function(limitPosts, page, category){
  url = all_posts_url;
  if (typeof limitPosts != 'undefined'){
    url += "?per_page="+limitPosts;
  }
  if(typeof page != 'undefined'){
    url += "&page="+page;
  }
  if (typeof category != 'undefined'){
    url += "&categories="+category;
  }
  return fetch(url)
         .then(data => data.json());
}

exports.getMenu = function(menu_id){
  url = menu_url+menu_id;
  return fetch(url)
        .then(data => data.json());
}
