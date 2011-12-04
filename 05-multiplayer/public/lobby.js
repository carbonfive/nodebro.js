jQuery(function($) {
  var lobby = io.connect('/lobby');
  var alertId = 0;
  var online = {};
  var highscores = [];
  lobby
    .on('announce', function(data) {
      var id = 'alert-'+(alertId++);
      var view = { nickname : data };
      var template = '<div id="'+id+'" class="alert-message info fade in">{{nickname}} is now online!</div>';
      var message = $($.mustache(template,view));
      online[view.nickname] = true;
      $('#alerts').append(message);
      bsalert(id);
      console.log( online );
      renderTable();
    })
    .on('offline', function(data) {
      var id = 'alert-'+(alertId++);
      var view = { nickname : data };
      var template = '<div id="'+id+'" class="alert-message fade in" data-alert="alert">{{nickname}} has gone offline.</div>';
      var message = $($.mustache(template,view));
      delete online[view.nickname];
      $('#alerts').append(message);
      bsalert(id);
      renderTable();
    })
    .on('highscores', function (data) {
      highscores = data;
      renderTable();
    })
    .emit('announce', nickname);

  function renderTable() {
    var highscoreNicknames = highscores.reduce(function(m,n){m[n.nickname]=true;return m;},{});
    var table = highscores.map( function(hs) { return { nickname:hs.nickname, score:hs.score, online:hs.online, updatedAt:hs.updatedAt }; });
    for (var nickname in online)
      if ( ! (nickname in highscoreNicknames) )
        table.push( { nickname:nickname, score:0, online:true } );
    table.sort(function(a,b) { return b.score-a.score; });
    table.forEach(function(hs, i) { hs.rank = (i+1); });
    table.sort(function(a,b) { return (b.online?1:-1) - (a.online?1:-1); });

    var view = { highscores:table, online:online };
    var template = '{{#highscores}}<tr><td>{{rank}}</td><td>{{#online}}<a class="btn success">Online</a>{{/online}}</td><td>{{nickname}}</td><td>{{updatedAt}}</td><td>{{score}}</td></tr>{{/highscores}}';
    var tableBody = $.mustache(template,view);
    $("table#highscores tbody").html(tableBody);
  }

  function bsalert(id) {
    $('#'+id).alert();
    setTimeout( function() { $('#'+id).fadeOut(300, remove); }, 3000 );
    function remove() { $('#'+id).remove(); }
  }
});
