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

exports.getMenu = function(menuName){
  return fetch(menu_url)
  .then(data => data.json())
  .then(allMenus => allMenus.find(menu => menu.name === menuName))
  .then(menu => menu.term_id)
  .then(wp_menu_id => (menu_url+wp_menu_id))
  .then(url => fetch(url))
  .then(data => data.json())
  .catch(e => JSON.stringify({error: "Menu not found"}));    
}