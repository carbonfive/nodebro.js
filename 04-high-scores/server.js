var express = require('express');
var sessions = require( "cookie-sessions" );
var app = express.createServer();

app.configure(function(){
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
  app.set('view engine','jade');
  app.set('view options',{layout:false});
  app.use( sessions( { secret: "notverysecretisit?", session_key : '_nodebrojs' } ) );
  app.use( express.bodyParser() );
  app.use(express.compiler({ src:__dirname+'/public', enable:['less'] }));
  app.use(express.static(__dirname+'/public'));
});

function authenticate( req, res, next ) {
  if ( ! req.session || ! req.session.nickname )
    return res.render('login');
  return next();
}

app.get('/', authenticate, function( req, res ) {
  res.render('lobby');
});

app.post('/login', function( req, res ) {
  (req.session = req.session || {}).nickname = req.body.nickname;
  res.redirect('/');
});

app.get('/logout', function( req, res ) {
  if ( req.session )
    delete req.session.nickname;
  res.redirect('/');
});

app.listen( 8500 );
