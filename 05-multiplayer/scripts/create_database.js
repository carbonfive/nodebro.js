var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('highscores');

db.run('CREATE TABLE highscores (nickname TEXT, updated INTEGER, score INTEGER)');
