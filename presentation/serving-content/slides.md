!SLIDE center subsection
# Serving Content

!SLIDE smaller
# File Serving

    @@@ javascript
    var http = require('http');
    var fs = require('fs');
    var url = require('url');

    var server = http.createServer(function(req,res) {
      var path = url.parse(req.url)['pathname'];

      fs.readFile(path,function(err,data) {
        res.writeHead(200, {
          'Content-Type': 'text/html'
          });
        res.end(data);
      });
    });

    server.listen(8500);

!SLIDE center screenshot expressjs
# [http://expressjs.com](http://expressjs.com)

!SLIDE command small
# server.js

    @@@ javascript
    var express = require('express');
    var app = express.createServer();

    app.configure(function(){
      app.use(express.static(__dirname+'/public'));
    });

    app.listen( 8500 );

!SLIDE bullets incremental
* ![nodejs](/file/images/nodejs-logo.png)

  *DOESN'T* come with Express
