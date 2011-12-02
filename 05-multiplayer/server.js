var express = require('express');
var sessions = require( "cookie-sessions" );
var highscores = require('./lib/highscores.js' );
var app = express.createServer();
var io = require("socket.io").listen(app);
var lobby = require("./lib/lobby").init(io);
var game = require("./lib/game").init(io);

app.configure(function(){
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
  app.set('view engine','jade');
  app.set('view options',{layout:false});
  app.use( sessions( { secret: "notverysecretisit?", session_key : '_nodebrojs' } ) );
  app.use( express.bodyParser() );
  app.use(express.compiler({ src:__dirname+'/public', enable:['less'] }));
  app.use(express.static(__dirname+'/public'));
  io.set('log level', 1);
});

function authenticate( req, res, next ) {
  if ( ! req.session || ! req.session.nickname )
    return res.render('login');
  return next();
}

app.get('/', authenticate, function( req, res, next ) {
  return highscores.all( withScores );

  function withScores( err, scores ) {
    if ( err ) return next( err );
    res.render('lobby', {nickname:req.session.nickname, scores:scores} );
  }
});

app.get('/game/:player/:id', authenticate, function( req, res ) {
  res.render('nodebro.js.jade', {
    nickname:req.session.nickname,
    isHost : req.params.player == '1' ? true : false,
    gameId:req.params.id
  } );
});

app.post('/win', authenticate, function( req, res, next ) {
  return highscores.win( req.body.nickname, onSave );
  function onSave( err ) {
    if ( err ) next( err );
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
