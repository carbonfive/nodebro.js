!SLIDE
# Serving Content

!SLIDE
# Long Example: Verbose

!SLIDE center screenshot expressjs
# [http://expressjs.com](http://expressjs.com)

!SLIDE
# configure

!SLIDE
# get

!SLIDE small
# listen

    @@@ javascript
    var express = require('express');
    var app = express.createServer();

    app.configure(function(){
      app.use(express.static(__dirname+'/public'));
    });

    app.listen( 8500 );
