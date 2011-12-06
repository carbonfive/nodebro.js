!SLIDE
# Serving Content

!SLIDE smaller

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

!SLIDE 
# require('express')

    @@@ javascript
    var express = require('express');
    var app = express.createServer();

!SLIDE
# .configure()

    @@@ javascript
    app.configure(function() {
      app.use(...);
      app.set(...);
      app.enable(...);
      app.disable(..);
    });

    app.configure('development', function() {
      ...
    });

!SLIDE
# .listen()

    @@@ javascript
    app.listen(...,...);

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
* Express *DOESN'T* come with 

  ![nodejs](/file/images/nodejs-logo.png)

