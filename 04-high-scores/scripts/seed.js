var highscores = require('../lib/highscores');

function lSequence(list,cb/*(item,next())*/, done/*()*/) {
  var l = list.slice(0);
  return (function next() {
    if ( l.length < 1 ) return done ? done() : null;
    cb(l.splice(0,1)[0], next);
  })();
}

lSequence( ['alex','rudy','foo','bar'], function(name, next) {
  var range = { alex:[1,2,3,4,5,6], rudy:[1,2,3], foo:[1,2,3,4,5,6,7,8,9,0,1], bar:[1,2] }[name];
  lSequence(range, function(x,next) { highscores.win(name, next); }, next);
}, process.exit );
