var express = require('express');
var sessions = require( "cookie-sessions" );
var highscores = require('./lib/highscores.js' );
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
  return highscores.all( withScores );

  function withScores( err, scores ) {
    if ( err ) return res.error( err );
    res.render('lobby', {nickname:req.session.nickname, scores:scores} );
  }
});

app.get('/game', authenticate, function( req, res ) {
  res.render('nodebro.js.jade', {nickname:req.session.nickname});
});

app.post('/win', authenticate, function( req, res ) {
  return highscores.win( req.body.nickname, onSave );
  function onSave( err ) {
    if ( err ) return res.error( err );
    res.send( 201 );
  }
});

app.post('/login', function( req, res ) {
  (req.session = req.session || {}).nickname = req.body.nickname.toLowerCase();;
  res.redirect('/');
});

app.get('/logout', function( req, res ) {
  if ( req.session )
    delete req.session.nickname;
  res.redirect('/');
});

app.listen( 8500 );
