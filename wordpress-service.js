const fetch = require('node-fetch');

const all_posts_url = "https://dbknews-wp.partner.nile.works/wp-json/posts";

exports.getPosts = function(limitPosts, category){
  url = all_posts_url;
  if (typeof limitPosts != 'undefined'){
    url += "?filter[posts_per_page]="+limitPosts;
  }
  if (typeof category != 'undefined'){
    url += "&filter[category_name]="+category;
  }
  return fetch(url)
         .then(data => data.json());
}
