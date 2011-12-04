jQuery(function($) {
  var lobby = io.connect('/lobby');
  var alertId = 0;
  var online = {};
  var highscores = [];
  var activeInvite;
  lobby
    .on('announce', function(name) {
      online[name] = true;
      quickAlert(name+' is now online!','info');
      renderTable();
    })
    .on('offline', function(name) {
      delete online[name];
      quickAlert(name+' has gone offline.','warning');
      renderTable();
    })
    .on('invite', function(host) {
      if ( activeInvite )
        return lobby.emit('decline',host);
      activeInvite = host;
      $('#inviting-host').text(host);
      $('#invite').modal({ backdrop:'static', show:true });
    })
    .on('error', function() {
      $('#invite').modal('hide');
      $('#inviting').modal('hide');
      activeInvite = null;
      quickAlert('Sorry, there was an invitation error','error');
    })
    .on('cancel', function() {
      $('#invite').modal('hide');
      activeInvite = null;
      quickAlert('The invite has been recinded','warning');
    })
    .on('decline', function() {
      $('#inviting').modal('hide');
      activeInvite = null;
      quickAlert('The invite has been declined','warning');
    })
    .on('highscores', function (data) {
      highscores = data;
      renderTable();
    })
    .on('accept', function( url ) {
      document.location.href = url;
    })
    .emit('announce', nickname);

  $('a.invite').live('click',function() {
    activeInvite = $(this).data('nickname');
    $('#inviting-invitee').text(activeInvite);
    $('#inviting').modal({ backdrop:'static', show:true });
    lobby.emit('invite', activeInvite );
  });

  $('#cancel-invitation').live('click',function() {
    $('#inviting').modal('hide');
    lobby.emit('cancel', activeInvite );
    activeInvite = null;
  });

  $('#decline-invitation').live('click',function() {
    $('#invite').modal('hide');
    lobby.emit('decline', activeInvite );
    activeInvite = null;
  });

  $('#accept-invitation').live('click',function() {
    lobby.emit('accept', activeInvite );
  });

  function renderTable() {
    var highscoreNicknames = highscores.reduce(function(m,n){m[n.nickname]=true;return m;},{});
    var table = highscores.map( function(hs) { return { nickname:hs.nickname, score:hs.score,
                               online:hs.nickname!=nickname && (!!online[hs.nickname]||hs.online),
                               updatedAt:hs.updatedAt }; });
    for (var name in online)
      if ( ! (name in highscoreNicknames) )
        table.push( { nickname:name, score:0, online:name != nickname } );
    table.sort(function(a,b) { return b.score-a.score; });
    table.forEach(function(hs, i) { hs.rank = (i+1); });
    table.sort(function(a,b) { return (b.online?1:-1) - (a.online?1:-1); });

    var view = { highscores:table, online:online };
    var template = '{{#highscores}}<tr><td>{{rank}}</td><td>{{#online}}'
                  +'<a class="invite btn success" data-nickname="{{nickname}}">Online</a>'
                  +'{{/online}}</td><td>{{nickname}}</td><td>{{updatedAt}}'
                  +'</td><td>{{score}}</td></tr>{{/highscores}}';
    var tableBody = $.mustache(template,view);
    $("table#highscores tbody").html(tableBody);
  }

  function quickAlert(text, type) {
    var id = 'alert-'+(alertId++);
    var message = $($.mustache('<div id="{{id}}" class="alert-message {{type}} fade in">{{text}}</div>',
                               {id:id,text:text,type:type}));
    $('#alerts').append(message);
    $('#'+id).alert();
    setTimeout( function() { $('#'+id).fadeOut(300, remove); }, 3000 );
    function remove() { $('#'+id).remove(); }
  }
});
