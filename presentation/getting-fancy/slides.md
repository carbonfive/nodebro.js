!SLIDE
# Getting Fancy

!SLIDE
Lobby

!SLIDE
# JADE

!SLIDE
# Semantics

!SLIDE
# Integrating

!SLIDE
# Templating

!SLIDE
Less.js

!SLIDE
# Good on the Client ...

!SLIDE
# ... and Server!

!SLIDE
# Semantics

!SLIDE
## CSS3

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
