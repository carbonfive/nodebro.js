var highscores = require('./highscores');

exports.init = function(io) {
  var online = [];
  var lobby = io.of('/lobby')
                .on('connection', function(socket) {
                  socket
                    .on('announce', function(nickname) {
                      online.push(nickname);
                      socket.set('nickname', nickname, function() {
                        lobby.emit('announce', nickname);
                        lobby.highscores();
                      });
                    })
                    .on('disconnect', function() {
                      socket.get('nickname', function(err, nickname) {
                        var index = online.indexOf(nickname);
                        if (~index) online.splice(index,1);
                        lobby.emit('offline', nickname);
                        lobby.highscores();
                      });
                    });
                });
  lobby['highscores'] = function() {
    return highscores.all(withscores);

    function withscores(err, scores) {
      if (err) throw err;
      var scoresOnline = [];
      for(var i = 0; i < scores.length; i++) {
        var score = scores[i];
        score['updatedAt'] = String(new Date(score.updated)).replace(/^\w{3}\s|\d{4}\s|GMT.*$/g,'');
        score['rank'] = i + 1;
        var index = online.indexOf(score.nickname);
        score['online'] = ~index ? true : false;
        scoresOnline.push(score);
      }
      lobby.emit('highscores', scoresOnline);
    }
  };
  return lobby;
};

