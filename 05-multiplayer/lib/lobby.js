var highscores = require('./highscores');
var lobby;
var online = {};

exports.init = function(io) {
  return lobby = io.of('/lobby').on('connection',connect);

  function connect(socket) {
    var nickname;
    socket.on('announce', announce)
          .on('invite', directMessage('invite') )
          .on('cancel', directMessage('cancel') )
          .on('decline', directMessage('decline') )
          .on('accept', accept )
          .on('disconnect', disconnect );

    function announce(nickname_) {
      nickname = nickname_;
      online[nickname] = socket;
      lobby.emit('announce', nickname);
      sendHighscores(socket);
    }

    function directMessage( message ) {
      return function( name ) {
        if ( ! online[name] )
          return socket.emit('error');
        online[name].emit(message,nickname);
      }
    }

    function accept( nickname ) {
      var gameId = randomString(6);
      if ( ! online[nickname] )
        return socket.emit('error');
      socket.emit('accept','/game/2/'+gameId);
      online[nickname].emit('accept','/game/1/'+gameId);
    }

    function disconnect() {
      delete online[nickname];
      lobby.emit('offline', nickname);
    };
  }
};

exports.scorechange = function() {
  sendHighscores(lobby);
}

function sendHighscores(connection) {
  return highscores.all(withscores);

  function withscores(err, scores) {
    if (err) throw err;
    var scoresOnline = [];
    for(var i = 0; i < scores.length; i++) {
      var score = scores[i];
      score['updatedAt'] = String(new Date(score.updated)).replace(/^\w{3}\s|\d{4}\s|GMT.*$/g,'');
      score['rank'] = i + 1;
      score['online'] = !!online[score.nickname];
      scoresOnline.push(score);
    }
    connection.emit('highscores', scoresOnline);
  }
};

function randomString( n ) {
  var token = [], r;
  for (var i=0; i<n; i++)
    token.push( (r = parseInt(Math.random()*36)) < 10 ? r : String.fromCharCode(87+r) );
  return token.join('');
}
