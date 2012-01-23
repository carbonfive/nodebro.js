var mongodb = require('mongodb');

var connection = new mongodb.Db('nodebrojs', new mongodb.Server("127.0.0.1", 27017, {auto_reconnect: true}), {});
var db;

function connect( cb ) {
  if ( db ) return cb(null, db);
  connection.open(function(err, db_) {
    return cb(err, db = db_);
  })
}

function highscores( cb ) {
  return connect( withDB );
  function withDB( err, db ) {
    db.collection('highscores', cb);
  }
}

exports.all = function( cb ) {
  return highscores( withHighscores );
  function withHighscores( err, highscores ) {
    if ( err ) return cb(err);
    highscores.find().toArray(cb);
  }
}

exports.win = function( nickname, cb ) {
  return highscores( withHighscores );
  function withHighscores( err, highscores ) {
    if ( err ) return cb(err);
    highscores.update( {nickname:nickname}, {$set:{updated:new Date()}, $inc:{score:1}}, {upsert:true}, cb );
  }
}
