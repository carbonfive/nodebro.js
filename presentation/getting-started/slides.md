!SLIDE
# Getting Started

!SLIDE
## Installing

!SLIDE
## Compiling

!SLIDE
## Homebrew On MacOSX

!SLIDE
## Running

    @@@ sh
    $ node
    > console.log('Hello, World!')
    Hello World!
    >

!SLIDE
## Or ...

    @@@ sh
    $ node helloWorld.js
    Hello, World!
    $

!SLIDE smaller
## Hello Web

    @@@ javascript
    var http = require('http');
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
    }).listen(1337, "127.0.0.1");
    console.log('Server running at http://127.0.0.1:1337/');
