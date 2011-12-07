!SLIDE subsection center
# Getting Started

!SLIDE center screenshot nodejsorg
# [http://nodejs.org](http://nodej.org)

!SLIDE
# Compiling

!SLIDE commandline incremental
# Mac OSX : Homebrew

    $ /usr/bin/ruby -e \
      "$(curl -fsSL https://raw.github.com/gist/323731)"

    $ brew install node

!SLIDE commandline incremental
# Running

    $ node
    > console.log('Hello, World!')
    Hello, World!
    $

!SLIDE commandline incremental
# Or ...

    $ node helloWorld.js
    Hello, World!

!SLIDE smaller command
# helloWorldServer.js

    @@@ javascript
    var http = require('http');

    var server = http.createServer(function (req, res) {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('Hello World\n');
    });

    server.listen(1337, "127.0.0.1");

    console.log(
      'Server running at http://127.0.0.1:1337/'
    );
