!SLIDE subsection center
# Testing

!SLIDE center screenshot jasmine
# [Jasmine](http://http://pivotal.github.com/jasmine/)

!SLIDE smaller
# Jasmine Sample

    @@@ javascript
    describe('some suite', function () {

      var suiteWideFoo;

      beforeEach(function () {
        suiteWideFoo = 0;
      });

      describe('some nested suite', function() {
        var nestedSuiteBar;
        beforeEach(function() {
          nestedSuiteBar=1;
        });

        it('nested expectation', function () {
          expect(suiteWideFoo).toEqual(0);
          expect(nestedSuiteBar).toEqual(1);
        });

      });
    });

!SLIDE bullets incremental
# ![Node](/file/images/nodejs-logo.png) Integration

* [github.com/mhevery/jasmine-node](http://github.com/mhevery/jasmine-node)

* BUT ...

* Can't Run Individual Tests

!SLIDE center screenshot mocha
# [Mocha](http://visionmedia.github.com/mocha/)

!SLIDE smaller
# Mocha Sample

    @@@ javascript
    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present', 
          function(){
            [1,2,3].indexOf(5).should.equal(-1);
            [1,2,3].indexOf(0).should.equal(-1);
        })
      })
    })

!SLIDE smaller
# Mocha Asynchronous

Call <code>done()</code> when complete:

    @@@ javascript
    describe('#find()', function(){
      it('respond with matching records', function(done){
        db.find({ type: 'User' }, function(err, res){
          if (err) return done(err);
          res.should.have.length(3);
          done();
        })
      })
    })

!SLIDE
# Full Integration Testing

!SLIDE center screenshot zombie
# [Zombie](http://zombie.labnotes.org/)

!SLIDE smaller
# Zombie Sample

    @@@ javascript
    var zombie = require("zombie");
    var assert = require("assert");

    // Load the page from localhost
    zombie.visit("http://localhost:3000/", 
      function (e, browser, status) {

      // Fill email, password and submit form
      browser.
        fill("email", "zombie@underworld.dead").
        fill("password", "eat-the-living").
        pressButton("Sign Me Up!", 
          function(e, browser, status) {

          // Form submitted, new page loaded.
          assert.equal(status, 200);
          assert.equal(browser.text("title"), 
            "Welcome To Brains Depot");
        })

    });
!SLIDE bullets incremental
# But

* It EMULATES the DOM
* Introducing Real HTML5 and JS crashed it!

!SLIDE screenshot center jasmine-headless-webkit
# [Jasmine Headless Webkit](http://github.com/mhevery/jasmine-node)
