!SLIDE subsection center
# Websockets

!SLIDE
![html5-websockets](html5-websockets-large.png)

!SLIDE
Diagram showing connection

!SLIDE screenshot center w3c
# [W3C Draft](http://dev.w3.org/html5/websockets/)

!SLIDE smaller
# Standard Events

    @@@ javascript
    var connection = new WebSocket(/* url */);

    connection.onopen = /* function */;

    connection.onmessage = /* function(event) */;

    connection.onerror = /* function(error) */;

    connection.onclose = /* function */;

!SLIDE bullets incremental
# BUT ...

* What's the format of the data?
* How do we handle the server-side?

!SLIDE
# Libraries

!SLIDE screenshot center socketio
# [socket.io](http://socket.io)

!SLIDE smaller
# Again, Great in Browser ...

    @@@ html
    <script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io.connect('http://localhost');
      socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
      });
    </script>

!SLIDE smaller
# ... And on Server!

    @@@ javascript
    var app = require('express').createServer()
      , io = require('socket.io').listen(app);

    app.listen(80);

    io.sockets.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });

!SLIDE smaller
# on() Events

    @@@ javascript
    // connection event on all sockets
    io.sockets.on('connection', function(socket) {
      // setup to handle your own events
      socket.on('foo', function(data) {
        // socket.io handles deserialization of data
      });

      // and gracefully handle disconnections
      socket.on('disconnect',function() {
      });
    });

!SLIDE smaller
# Send events with <code>emit()</code>

    @@@ javascript
    // data is automatically serialized!
    socket.emit('foo', data);

!SLIDE semantics smaller
# An Example

* ### Server

      @@@ javascript
      io.sockets.on('connection', 
        function (socket) {
          socket
            .on('my other event', 
                function (data) {
                  console.log(data);
            })
            .emit('news',
                  { hello : 'world' });
      });

* ### Client

      @@@ javascript
      socket.on('news', 
        function (data) {
          socket.emit('my other event', 
                      { my: 'data' });
      });
 
!SLIDE
# Who's Online

!SLIDE semantics smaller incremental
# Use Namespace to Handle Just Lobby Connections

* ### Client

      @@@ javascript
      io.connect('/lobby');

* ### Server

      @@@ javascript
      var lobby =
        io.of('/lobby')
          .on('connection',
              function(socket) {
                ...

                // send a message to all
                lobby.emit('message', data);

                ...
              });
!SLIDE
# Build Each Page Like It's Own Little App

!SLIDE
# Multiplayer Game!

!SLIDE
# Javasript Everywhere Allows You To Moving Logic From Client to Server ... and Back!
