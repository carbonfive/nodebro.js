jQuery(function($) {
  var lobby = io.connect('/lobby');
  lobby
    .on('announce', function(data) {
      var view = { nickname : data };
      var template = '<div class="alert-message info fade in">{{nickname}} has come online!</div>';
      var message = $($.mustache(template,view));
      $('#alerts').append(message);
      $('.alert-message').alert();
    })
    .on('offline', function(data) {
      var view = { nickname : data };
      var template = '<div class="alert-message fade in">{{nickname}} has gone offline.</div>';
      var message = $($.mustache(template,view));
      $('#alerts').append(message);
    })
    .on('highscores', function (data) {
      var view = { highscores : data };
      var template = '{{#highscores}}<tr><td>{{rank}}</td><td>{{#online}}<a class="btn success">Online</a>{{/online}}</td><td>{{nickname}}</td><td>{{updatedAt}}</td><td>{{score}}</td></tr>{{/highscores}}';
      var tableBody = $.mustache(template,view);

      $("table#highscores tbody").html(tableBody);
    })
    .emit('announce', nickname);
  $(".alert-message").alert();
});
