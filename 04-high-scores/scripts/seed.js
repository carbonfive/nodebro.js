var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('highscores');

var query = db.prepare('INSERT INTO highscores (nickname,updated,score) VALUES (?,?,?)');
query.run('alex',new Date(), 6);
query.run('rudy', new Date((new Date().getTime() - 3600*32.3243)|0), 4);
query.run('foo', new Date((new Date().getTime() - 3600*23.293)|0), 11);
query.run('bar', new Date((new Date().getTime() - 3600*48.2884)|0), 2);
query.finalize();
