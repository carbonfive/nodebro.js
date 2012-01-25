!SLIDE center subsection
# Going Modular

!SLIDE screenshot center highscores
# [Adding Highscores](http://127.0.0.1:8500)

!SLIDE
# require()

    @@@ javascript
    var http = require('http');
    var express = require('express');

!SLIDE
# Writing your own

<code>lib/foo.js</code>

    @@@ javascript
    exports.foo = function() {
      console.log('foo!');
    }

!SLIDE
# Bringing it in

    @@@ javascript
    var foo = require('./lib/foo');

    foo.foo();

!SLIDE smaller
# Make it Work for Both Browser and Server

    @@@ javascript
    (function(container) {
      container.foo = ...
    })(typeof exports == undefined ? window : exports );

!SLIDE subsection center
# Integrating

!SLIDE smaller
# Middleware Aware

Great for filters, pre-loading, etc:

    @@@ javascript
    app.get(path,
            /* [function1, function2, ...,] */
            function(req,res) {
              ...
        });

    function1(req, res, next) {
      // return any value to interrupt or ...
      return next(); // to continue normally!!
    });

!SLIDE smaller
# Authentication

    @@@ javascript
    function authenticate( req, res, next ) {
      if ( ! req.session || ! req.session.nickname )
        return res.render('login');
      return next();
    }

    app.get('/game', authenticate, function( req, res ) {
      res.render('nodebro.js.jade', 
        {nickname:req.session.nickname});
    });

!SLIDE smaller
# Passing Data to Jade

Pass them in an object to <code>render()</code>:

    @@@ javascript
    res.render('template' /*, 
               { var1 : value, var2 : value, ... } */
              );

In Jade

    @@@ javascript
    // output as content of element
    h1= var1

    // or interpolate
    h2 The value of var2 is #{var2}

!SLIDE smaller
# Putting it Altogether

    @@@ javascript
    app.get('/', authenticate, function( req, res ) {
      return highscores.all( withScores );

      function withScores( err, scores ) {
        if ( err ) return res.error( err );
        res.render('lobby', 
                   { nickname : req.session.nickname,
                     scores : scores
                   });
      }
    });

!SLIDE smaller
# <code>post()</code>-ing Data

    POST /path
    param1=value1
    param2=value2
    param3=value3
    ...

We can route to a handler

    @@@ javascript
    app.post('path', function(req, res) {
      /* req.body.paramName == value */
    });

!SLIDE smaller
# Submitting Scores

    @@@ javascript
    app.post('/win', authenticate, function( req, res ) {
      return highscores.win( req.body.nickname, onSave );
      function onSave( err ) {
        if ( err ) return res.error( err );
        res.send( 201 );
      }
    });
