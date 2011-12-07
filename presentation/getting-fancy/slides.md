!SLIDE center subsection
# Getting Fancy

!SLIDE screenshot center lobby
# [Lobby](http://127.0.0.1:8500/)

!SLIDE screenshot center jade
# [http://jade-lang.com](http://jade-lang.com)

!SLIDE semantics smaller center incremental
# Semantics
* ### <code>.jade</code> becomes ...

      @@@ javascript
      !!! 5
      html(lang="en")
        head
          title= pageTitle
          script(type='text/javascript')
            if (foo) {
               bar()
            }
        body
          h1 Jade
          #container
            - if (youAreUsingJade)
              p You are amazing
            - else
              p Get on it!

* ### ... generated HTML

      @@@ html
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Jade</title>
          <script type="text/javascript">
            if (foo) {
            bar()
            }
          </script>
        </head>
        <body>
          <h1>Jade</h1>
          <div id="container">
            <p>You are amazing</p>
          </div>
        </body>
      </html>

!SLIDE incremental 
# Express Integration

Set the 'view engine' in  <code>.configure()</code>

      @@@ javascript
      app.set('view engine','jade');

!SLIDE incremental
# Express Integration 

Handle the route with <code>.get()</code>

      @@@ javascript
      app.get('/', function(req,res) {
        res.render('view.jade');
      });

!SLIDE incremental
# Express Integration

Update the <code>package.json</code>

      @@@javascript
      { ...
        "dependencies" : {
          ...
          "jade" : "0.18"
        }
      }

!SLIDE jade-templating smaller incremental
# Templating

* #### <code>views/template.jade</code>

      @@@ javascript
      extends layout

      block title
        | My Title
      block content
        ul
          li one
          li two
          li three

* #### +  <code>views/layout.jade</code>

      @@@ javascript
      !!! 5
      html
        head
          title
            block head
        body
          h1
            block head
          div.content
            block content
          div#footer
            block footer
              p General Footer

* #### = generated HTML

      @@@ html
      <!DOCTYPE "html">
      <html>
        <head>
          <title>My Title</title>
        </head>
        <body>
          <h1>My Title</h1>
          <div class="content">
            <ul>
              <li>one</li>
              <li>two</li>
              <li>three</li>
            </ul>
          </div>
          <div class="footer">
            <p>General Footer</p>
          </div>
        </body>
      </html>

!SLIDE screenshot center lesscss
# [lesscss.org](http://lesscss.org)

!SLIDE semantics smaller incremental
# Semantics

* #### <code>public/styles.less</code>

      @@@ css
      @bgcolor: #111;

      .rounded-corners (@radius: 5px) {
        border-radius: @radius;
        -webkit-border-radius: @radius;
        -moz-border-radius: @radius;
      }

      #header {
        .rounded-corners;
        background-color: @bgcolor * 3;

        h1 {
          .rounded-corners(10px);
          font-size: 26px;
          font-weight: bold;
        }

        p { font-size: 12px;
          a { text-decoration: none;
            &:hover { 
              border-width: 1px; 
            }
          }
        }
      }

* #### generates <code>public/styles.css</code>
      @@@ css
      #header {
        border-radius: 5px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        background-color: #333;
      }

      #header h1 {
        border-radius: 10px;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        font-size: 26px;
        font-weight: bold;
      }

      #header p {
        font-size: 12px;
      }

      #header p a {
        text-decoration: none;
      }

      #header p a:hover {
        border-width: 1px;
      }

!SLIDE small
# Good In Browser ...

    @@@ html
    <link rel="stylesheet/less" 
          type="text/css" href="styles.less">
    <script src="less.js" 
            type="text/javascript"></script>

!SLIDE small incremental
# ... or ![nodejs](/file/images/nodejs-logo.png)

      @@@ javascript
      var less = require('less');

      less.render('.class { width: 1 + 1 }', 
                  function (e, css) {
                    console.log(css);
      });

!SLIDE 
# Express Integration

Setup in <code>configure()</code> BEFORE any static file configuration:

    @@@ javascript
    app.use(express.compiler({ 
      src : __dirname+'/public',
      enable :['less'] 
    }));

!SLIDE
# Express Integration

Add the dependency in <code>package.json</code>

      @@@javascript
      { ...
        "dependencies" : {
          ...
          "less" : "1.1"
        }
      }

!SLIDE command smaller
# server.js

    @@@ javascript
    var express = require('express');
    var app = express.createServer();

    app.configure(function(){
      app.use(express.errorHandler({ showStack: true, 
                                     dumpExceptions: true }));
      app.set('view engine','jade');
      app.use(express.compiler({ src:__dirname+'/public', 
                                 enable:['less'] }));
      app.use(express.static(__dirname+'/public'));
    });

    app.get('/', function( req, res ) {
      res.render('lobby');
    });

    app.listen( 8500 );
