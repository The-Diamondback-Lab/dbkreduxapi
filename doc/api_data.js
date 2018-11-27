define({ "api": [
  {
    "type": "get",
    "url": "/articles/:articleId",
    "title": "Gets a single DBK Article",
    "name": "GetArticle",
    "group": "Articles",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "articleId",
            "description": "<p>Unique article ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Articles"
  },
  {
    "type": "get",
    "url": "/articles?preview={boolean}",
    "title": "Gets a list of DBK articles",
    "name": "GetArticles",
    "group": "Articles",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "preview",
            "description": "<p>Whether to retrieve full article data or just preview data.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "per_page",
            "description": "<p>The number of articles to retrieve per page.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "description": "<p>The page of articles to retrieve.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "category",
            "description": "<p>The category ID from which to retrieve articles.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Articles"
  },
  {
    "type": "get",
    "url": "/menu/:menuId",
    "title": "Gets data for a menu",
    "name": "GetMenu",
    "group": "Menu",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "menuId",
            "description": "<p>Unique Menu ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "Menu"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./doc/main.js",
    "group": "_home_akguthal_diamondback_dbk_redux_api_doc_main_js",
    "groupTitle": "_home_akguthal_diamondback_dbk_redux_api_doc_main_js",
    "name": ""
  }
] });