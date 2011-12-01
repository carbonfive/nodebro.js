var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('highscores');

exports.all = function( callback ) {
  db.all('SELECT * FROM highscores ORDER BY score desc', callback );
};

exports.win = function( nickname, callback ) {
  return db.get('SELECT score from highscores WHERE nickname=?', nickname, withResult );
  function withResult( err, result ) {
    if ( err ) return callback(err);
    if ( result )
      db.run('UPDATE highscores SET score=?, updated=? where nickname=?', result.score+1, new Date(), nickname, callback );
    else
      db.run('INSERT INTO highscores (nickname, updated, score) VALUES (?,?,?)', nickname, new Date(), 1, callback );
  }
}
