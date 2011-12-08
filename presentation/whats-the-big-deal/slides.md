!SLIDE center subsection
# What's the Big Deal?

!SLIDE
# It's HAWT

!SLIDE bullets incremental
# Growth

* ![Jobs Growth](jobgraph.png)

  source: [Indeed](http://indeed.com)

!SLIDE bullets incremental
# Growth

* ![Node Committers](node-commits-committers.jpg)

  source: [Mashable](http://mashable.com/2011/03/10/node-js/)

!SLIDE bullets incremental
# Libraries

* ![Libraries](npm-registry.png)

  source: [NPM Registry](http://search.npmjs.org/)

!SLIDE bullets incremental
# #1 Watched

* ![!Most Watched](most-watched.png)

!SLIDE
![brogrammer](brogrammer.jpg)

!SLIDE
# Same Language Everywhere

    @@@ javascript
    setTimeout(function() {
      console.log('World!');
    }, 2000);

    console.log("Hello!");

!SLIDE
# It's "Fast"

!SLIDE incremental bullets
# Its Highly Optimized Concurrency

!SLIDE center
![Concurrency](concurrency.png)

!SLIDE
# Waiting for I/O is SLOW
![Cost of I/O](io-cost.png)

!SLIDE incremental smaller
# Scenario

* 1 process running our app
* 2 requests come in concurrently
* For each request:
  * 50ms of processing
  * 200ms to run a database query
  * 50ms to generate a response
* How long will it take?

source: [Mixu's Blog](http://blog.mixu.net/2011/02/01/understanding-the-node-js-event-loop/)

!SLIDE center
# Blocking

![blocking-timeline](blocking-timeline.png)

!SLIDE
# ![Node.js](/file/images/nodejs-logo.png) has <br />"Non-Blocking" I/O

!SLIDE center
# "Non-Blocking"

![nonblocking-timeline](nonblocking-timeline.png)

!SLIDE
# Evented I/O

!SLIDE
# Ruby

      @@@ ruby
      def index
        count = Users.count
        render :text => count
      end

!SLIDE
# Javascript

      @@@ javascript
      app.get('/', function(req,res) {
        users.count(function(err,count) {
          res.send(count);
        });
      });

!SLIDE command smaller
# helloWorldServerTimeout.js

    @@@ javascript
    var http = require('http');
    var server = http.createServer(function (req, res) {
      // contrived example activate!
      setTimeout(function() {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('Hello World\n');
      },2000);
    });

    server.listen(1337, "127.0.0.1");

    console.log(
      'Server running at http://127.0.0.1:1337/'
    );

!SLIDE commandline incremental

    $ siege -b -c 10 -r 1 http://127.0.0.1:1337/
    ** SIEGE 2.70
    ** Preparing 10 concurrent users for battle.
    The server is now under siege...
    ...
    done.
    Transactions:                     10 hits
    Availability:                 100.00 %
    Elapsed time:                   2.01 secs
    Data transferred:               0.00 MB
    Response time:                  2.01 secs
    Transaction rate:               4.98 trans/sec
    Throughput:                     0.00 MB/sec
    Concurrency:                   10.00
    Successful transactions:          10
    Failed transactions:               0
    Longest transaction:            2.01
    Shortest transaction:           2.01

!SLIDE commandline incremental

    $ siege -b -c 100 -r 1 http://127.0.0.1:1337/
    ** SIEGE 2.70
    ** Preparing 250 concurrent users for battle.
    The server is now under siege...
    ...
    done.
    Transactions:                    100 hits
    Availability:                 100.00 %
    Elapsed time:                   2.03 secs
    Data transferred:               0.00 MB
    Response time:                  2.00 secs
    Transaction rate:              49.26 trans/sec
    Throughput:                     0.00 MB/sec
    Concurrency:                   98.60
    Successful transactions:         100
    Failed transactions:               0
    Longest transaction:            2.01
    Shortest transaction:           2.00

!SLIDE bullets incremental small
# It's Not the Only <br />Event(ed I/O) In Town

* Ruby - [EventMachine](http://http://rubyeventmachine.com/)
* Python - [Twisted](http://twistedmatrix.com/trac/)
* Web Server - [ngnix](http://nginx.org/)
