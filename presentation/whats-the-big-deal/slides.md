!SLIDE
# What's the Big Deal?

!SLIDE
# STUPIDEST REASON?

!SLIDE
# It's HAWT, bro!

![jobgraph.png](jobgraph.png)

!SLIDE
![brogrammer](brogrammer.jpg)

!SLIDE
# Same Language on
# Client and Server

    @@@ javascript
    setTimeout(function() {
      console.log('World!');
    }, 2000);

    console.log("Hello!");

!SLIDE
# "Non-Blockig" I/O

!SLIDE
# Evented I/O

!SLIDE smaller

* Ruby

      @@@ ruby
      def index
        count = Users.count
        render :text => count
      end

* Javascript

      @@@ javascript
      app.get('/', function(req,res) {
        var count = users.count(function(err,count) {
          res.send(count);
        });
      });

!SLIDE incremental
# Scenario

* 1 process running our app
* 2 requests come in concurrently
* For each request:
  * 50ms of processing
  * 200ms to run a database query
  * 50ms to generate a response
* How long will it take?

!SLIDE center
# Blocking

![blocking-timeline](blocking-timeline.png)

!SLIDE
# Non-Blocking
![nonblocking-timeline](nonblocking-timeline.png)

!SLIDE
# Let's See the Numbers

!SLIDE
# ... vs. Optimized
