var game;  // socket connecting to game controller

function el(id) { return document.getElementById(id); }
function range(n,f) { var a=[]; for (var i=0; i<n; i++) a.push(f(i)); return a; }
function absmax(x,max) { return x>=0 ? Math.max(x,max) : Math.min(x,-max); }
function absmin(x,max) { return x>=0 ? Math.min(x,max) : Math.max(x,-max); }

/*
 View control, listens for game state changes
 Maintains list of sprites
 updates sprites with new trajectories on change.
 */
function ViewControl() {
  var sprites = {}, events = [], altered, scores={'player-1':0, 'player-2':0}, misses=0, viewTimer;
  var platforms = {};
  var nicknames = {};

  function startGame() {
    viewTimer = setInterval( draw, 33);
  }

  function draw() {
    var time = new Date().getTime() / 1000, altered, type;
    while (events[0] && time > events[0].time) {
      for (var id in events[0].altered) {
        altered = events[0].altered[id];
        type = id.split('-');
        if ( events[0].type == 'remove' ) {
          delete sprites[id];
        } else if ( type[0] == 'player' && !(id in sprites) )  {
          sprites[id] = PlayerSprite(id);
        } else if ( type[0] == 'coin' && !(id in sprites) )  {
          sprites[id] = CoinSprite(id);
        } else if ( type[0] == 'platform' && !(id in platforms) )  {
          platforms[id] = altered;
        }
        var sprite = sprites[id];
        if ( sprite )
          sprite.update( events[0].time, altered );
      }
      events = events.slice(1);
    }

    var ctx = el('display').getContext('2d');
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

    ctx.translate(0,ctx.canvas.height); ctx.scale(1,-1);

    ctx.fillStyle = '#6cf'; ctx.strokeStyle = '#00f'; ctx.lineWidth = 2;
    ctx.beginPath();
    for ( var id in platforms )
      ctx.rect(platforms[id].x,platforms[id].y,platforms[id].width,platforms[id].height);
    ctx.fill(); ctx.stroke();

    for ( var id in sprites )
      sprites[id].draw( time, ctx );

    ctx.restore();

    ctx.font = '20px Helvetica';
    ctx.fillStyle = '#fff';
    ctx.fillText((nicknames['player-1']||'player 1')+': '+scores['player-1'], 10, 20 );
    var p2Score = (nicknames['player-2']||'player 2')+': '+scores['player-2']
    ctx.fillText( p2Score, 590 - ctx.measureText( p2Score ).width, 20 );

    return ctx;
  }

  function message( overMessage ) {
    var ctx = draw();
    ctx.save();
    ctx.font = ' bold 60px Helvetica';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.lineWidth=5;
    ctx.strokeText(overMessage, 300 - ctx.measureText(overMessage).width/2, 225 );
    ctx.fillText(overMessage, 300 - ctx.measureText(overMessage).width/2, 225 );
    ctx.restore();
  }

  function endGame() {
    clearInterval( viewTimer );
    var winner = nicknames['player-' + (scores['player-1'] > scores['player-2'] ? 1 : 2)];
    message(  winner.toUpperCase() + ' WINS' );
    setTimeout( function() { document.location.href = '/';  }, 5000 );
  }

  function newPlayer( data ) {
    nicknames = data.nicknames;
    message( data.nickname + ' has joined' );
  }

  return {
    update : function(events_) {
      events = events.filter(function(e) {
        return e.time < events_[0].time; 
      }).concat(events_);
    },
    join : newPlayer,
    prepare : function() { message( 'Get Ready' ); },
    score : function(data) { scores[data.id] = data.score; },
    startGame : startGame,
    gameover : endGame
  }
}

function Sprite() {
  var x0=0, y0=0, vx=0, vy=0, ax=0, ay=0, t0=0;
  return {
    position : function( time ) {
      var t = time - t0;
      return { x : ax*t*t/2 + vx*t + x0, y : ay*t*t/2 + vy*t + y0 };
    },
    update : function( time, o ) { 
      t0=time; x0=o.x; y0=o.y; vx=o.vx; vy=o.vy; ax=o.ax; ay=o.ay; 
    }
  }
}

function PlayerSprite(id) {
  var sprite = Sprite();
  return {
    draw : function( time, ctx ) {
      var position = sprite.position(time);

      ctx.save(); ctx.fillStyle = {'player-1':'#f00', 'player-2':'#00f'}[id]; 
      ctx.beginPath();
      ctx.rect(position.x, position.y, 30, 30);
      ctx.fill(); ctx.restore();
    },
    update : sprite.update
  }
}

function CoinSprite() {
  var sprite = Sprite();
  return {
    draw : function( time, ctx ) {
      var position = sprite.position(time);

      ctx.save(); ctx.fillStyle = 'rgba(255,205,0,6)'; ctx.beginPath();
      ctx.arc(position.x + 10, position.y + 10, 10, 0, 2*Math.PI );
      ctx.fill(); ctx.restore();
    },
    update : sprite.update
  }
}

function init() {
  view = ViewControl();
  game = io.connect('/game');

  game.on('connect', function () {
    game.emit('join', {nickname:nickname, gameId:gameId, isHost:isHost});

    function handle(type,f) {
      game.on( type, function(data) { f(data); } );
    }
    handle('update', view.update);
    handle('joined', view.join);
    handle('prepare', view.prepare);
    handle('score', view.score);
    handle('gameover', view.gameover);
    handle('startGame', view.startGame);
  });

  var keysDown = {};
  var downEvents = { 37:'playerLeftDown', 39:'playerRightDown', 32:'playerJumpStart'};
  window.onkeydown = handleKey( function( code, events ) {
    if (keysDown[code]) return false;
    var message = downEvents[code];
    if ( message ) {
      keysDown[code] = true;
      return game.emit(message);
    }
  } );

  var upEvents = { 37:'playerKeyUp', 39:'playerKeyUp', 32:'playerJumpEnd'};
  window.onkeyup = handleKey( function( code ) { 
    var message = upEvents[code];
    if ( message ) {
      delete keysDown[code];
      return game.emit(message);
    }
  } );
}

function handleKey( f, events ) {
  return function( event ) {
    event = event || window.event;
    var code = event.keyCode || event.which;
    return f(code, events ) !== false;
  }
}

window.onload = init;
