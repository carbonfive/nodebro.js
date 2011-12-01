var PLATFORM_WIDTH = 20, LEVEL_SPACING = 95;
var PLATFORMS = [[-20,PLATFORM_WIDTH,640],
                 [0,LEVEL_SPACING+PLATFORM_WIDTH,220],
                 [380,LEVEL_SPACING+PLATFORM_WIDTH,220],
                 [150,2*LEVEL_SPACING+PLATFORM_WIDTH,300], 
                 //[0,2*LEVEL_SPACING+PLATFORM_WIDTH,220],
                 //[380,2*LEVEL_SPACING+PLATFORM_WIDTH,220],
                 [0,3*LEVEL_SPACING+PLATFORM_WIDTH,220],
                 [380,3*LEVEL_SPACING+PLATFORM_WIDTH,220]];

var engine, game;

function el(id) { return document.getElementById(id); }
function range(n,f) { var a=[]; for (var i=0; i<n; i++) a.push(f(i)); return a; }
function absmax(x,max) { return x>=0 ? Math.max(x,max) : Math.min(x,-max); }
function absmin(x,max) { return x>=0 ? Math.min(x,max) : Math.max(x,-max); }

function GameControl() {
  var engine = Physics( -4000, 4000 ), 
      time = new Date().getTime()/1000, 
      callback, 
      state, 
      coinIndex=0,
      timers = [], 
      scores={'player-1':0, 'player-2':0}, 
      misses=0,
      gameOver = false,
      physicsTimer,
      coinTimer;

  PLATFORMS.forEach( function(p,i) { engine.addFixture( time, 'platform-'+i, { 
      x:p[0], y:p[1]-PLATFORM_WIDTH, width:p[2], height:PLATFORM_WIDTH } ) } );
  engine.addFixture( time, 'wall-right', {x:-5, y:LEVEL_SPACING, width:5, height:700} );
  engine.addFixture( time, 'wall-left', {x:600, y:LEVEL_SPACING, width:5, height:700} );
  engine.addFixture( time, 'tunnel-left', {x:-25, y:0, width:5, height:LEVEL_SPACING} );
  engine.addFixture( time, 'tunnel-right', {x:620, y:0, width:5, height:LEVEL_SPACING} );

  engine.addBox( time, 'player-1', {x:0, y:PLATFORM_WIDTH + 5, width:30, height:30, maxVx:400, maxVy:400} );
  engine.addBox( time, 'player-2', {x:570, y:PLATFORM_WIDTH + 5, width:30, height:30, maxVx:400, maxVy:400} );

  function dropCoin() {
    var speed = 200 + (600 * Math.random())|0;
    if ( Math.random() >= .5 )
      engine.addBox( setTime(), 'coin-'+(coinIndex++), { x:0, y:385, width:20, height:20, vx:speed, friction:false });
    else
      engine.addBox( setTime(), 'coin-'+(coinIndex++), { x:580, y:385, width:20, height:20, vx:-speed, friction:false });
    update();
    coinTimer = setTimeout( dropCoin, 3000 + (2000/(.5+Math.random()))|0 )
  }

  function setTime() { return time = new Date().getTime() / 1000; } 

  function handleAtEventTime( evt, handler ) {
    var time = setTime();
    if ( evt.time <= time ) return;
    timers.push( setTimeout(function() {
      handler( evt );
    }, (1000*(evt.time-time))|0 ) );
  }

  function handlePickup( evt ) {
    var coin, player;
    for ( var id in evt.altered ) {
      if ( id.match(/^coin-/) ) coin = id;
      else if ( id.match(/^player-/) ) player = id;
    }
    ++scores[player];
    if (callback) callback([{ time:evt.time, type:'score', score:scores[player], id:player }]);
    engine.removeFeature( evt.time-.001, coin );
    if ( scores[player] >= 5 )
      endGame();
    return update();
  }

  function handleUnderBounce( evt ) {
    var bouncer = evt.altered[evt.first], 
        bounced = engine.currentState()[evt.first=='player-1'?'player-2':'player-1'];
    console.log( 'under bounce testing', engine.currentState(), bouncer, bounced );
    if ( ! bounced || ! bounced.resting || ! bounced.resting in evt.altered ) return;
    if ( Math.abs(bouncer.x - bounced.x) > 30 ) return;
    bouncePlayer( bounced, evt.time );
    engine.alter( evt.time, bounced.id, {vy:500} );
    update();
  }

  function handleBounce( evt ) {
    var player1 = evt.altered['player-1'], player2 = evt.altered['player-2'], 
        bounced = player1.y > player2.y ? player2 : player1, bouncer = player1.y > player2.y ? player1 : player2;
    bouncePlayer( bounced, evt.time );
    engine.alter( evt.time, bouncer.id, {vy:1000} );
    update();
  }

  function bouncePlayer( bounced, time ) {
    for ( var i=0; i < scores[bounced.id]; i++ ) {
      if ( i%2 )
        engine.addBox( time+i*.1, 'coin-'+(coinIndex++), { x:bounced.x+60, y:bounced.y+5, width:20, height:20, vx:100, vy:400, friction:false });
      else
        engine.addBox( time+i*.1, 'coin-'+(coinIndex++), { x:bounced.x-30, y:bounced.y+5, width:20, height:20, vx:-100, vy:400, friction:false });
    }
    scores[bounced.id] = 0;
    if (callback) callback([{ time:time, type:'score', score:scores[bounced.id], id:bounced.id }]);
  }

  function handleCoinExit( evt ) {
    var coin;
    for ( var id in evt.altered )
      if ( id.match(/^coin-/) ) coin = id;
    engine.removeFeature( evt.time-.001, coin );
    return update();
  }

  function endGame() {
    timers.forEach(clearInterval);
    timers.length = 0;
    clearTimeout(coinTimer);
    clearInterval(physicsTimer);
    gameOver = true;
    if ( scores['player-1'] > scores['player-2'] )
      request({ method:'POST', url:'/win', body:'nickname='+encodeURIComponent(nickname)});
    if (callback) callback( [{ time:setTime(), type:'endgame' }] );
  }

  function update() {
    if ( gameOver ) return;
    state = engine.update( setTime()-.5, 2 );

    timers.forEach(clearInterval);
    timers.length = 0;

    for (var i=0,evt; evt = state[i]; i++ ) {
      if ( evt.type in {start:1, end:1} ) continue;
      var types = {};
      for ( var id in evt.altered ) 
        types[id.split('-')[0]] = true;
      if ( 'coin' in types && 'player' in types ) 
        handleAtEventTime( evt, handlePickup );
      else if ( 'coin' in types && 'tunnel' in types )
        handleAtEventTime( evt, handleCoinExit );
      else if ( 'player-1' in evt.altered && 'player-2' in evt.altered && evt.type in {tb:1,bt:1} )
        handleAtEventTime( evt, handleBounce );
      else if ( 'tb' == evt.type && 'player' in types )
        handleAtEventTime( evt, handleUnderBounce );
    }

    if ( callback ) return callback( state );
  }

  function request( options ) {
    var xhr =  window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if ( xhr.readyState < 4 )
        return;
      if ((!xhr.status && (location.protocol == "file:")) ||
        ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223)
        if (options.handler) options.handler(xhr.responseText);
      else if (options.errorHandler)
        options.errorHandler(xhr.status)
    };
    xhr.open(options.method || 'GET', options.url, true );
    if (options.headers) for (var k in options.headers) xhr.setRequestHeader(k, options.headers[k]);
    if (("POST" === options.method) && (( ! options.headers ) || ( ! options.headers['Content-Type'] )))
      xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send( options.body || null );
  }

  function stateFor(id) {
    var time = setTime(), boxState;
    for ( var i=0, event; (event=state[i]) && event.time <= time; i++ ) {
      boxState = event.altered[id] || boxState;
    }
    return boxState || {};
  }

  physicsTimer = setInterval( update, 1000 );
  setTimeout( update, 5 );
  coinTimer = setTimeout( dropCoin, 3000);

  return {
    onUpdate : function( f ) { callback = f; },
    playerLeftDown: function(player) { engine.alter( setTime(), player, {ax:-1000, friction:false} ); update(); },
    playerRightDown: function(player) { engine.alter( setTime(), player, {ax:1000, friction:false} ); update(); },
    playerKeyUp: function(player) { engine.alter( setTime(), player, {ax:0, friction:true} ); update(); },
    playerJumpStart: function(player) { if (stateFor(player).resting) engine.alter( setTime(), player, {vy:800, ay:1500} ); update(); },
    playerJumpEnd: function(player) { engine.alter( setTime(), player, {ay:0} ); update(); },
  }
}

/*
 View control, listens for game state changes
 Maintains list of sprites
 updates sprites with new trajectories on change.
 */
function ViewControl() {
  var sprites = {}, events = [], altered, scores={'player-1':0, 'player-2':0}, misses=0;

  function draw() {
    var time = new Date().getTime() / 1000;
    while (events[0] && time > events[0].time) {
      for (var id in events[0].altered) {
        altered = events[0].altered[id];
        if ( events[0].type == 'add' && ! altered.fixed ) {
          sprites[altered.id] = (altered.id.match(/^player-/) ? PlayerSprite : CoinSprite)(altered.id);
        } else if ( events[0].type == 'remove' ) {
          delete sprites[id];
        }
        var sprite = sprites[altered.id];
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
    PLATFORMS.forEach( function(p) { ctx.rect(p[0],p[1]-PLATFORM_WIDTH,p[2],PLATFORM_WIDTH); } );
    ctx.fill(); ctx.stroke();

    for ( var id in sprites )
      sprites[id].draw( time, ctx );

    ctx.restore();

    ctx.font = '20px Helvetica';
    ctx.fillStyle = '#fff';
    ctx.fillText('1st player: '+scores['player-1'], 10, 20 );
    ctx.fillText('2nd player: '+scores['player-2'], 590 - ctx.measureText('2nd player: '+scores['player-2'] ).width, 20 );
  }

  var viewTimer = setInterval( draw, 33);

  function endGame() {
    clearInterval( viewTimer );
    draw();
    var ctx = el('display').getContext('2d');
    ctx.font = ' bold 60px Helvetica';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.lineWidth=5;
    var overMessage = 'PLAYER ' + (scores['player-1'] > scores['player-2'] ? 1 : 2) + ' WINS';
    ctx.strokeText(overMessage, 300 - ctx.measureText(overMessage).width/2, 225 );
    ctx.fillText(overMessage, 300 - ctx.measureText(overMessage).width/2, 225 );
    setTimeout( function() { document.location.href = '/';  }, 5000 );
  }

  return {
    update : function(events_) { 
      events = events.filter(function(e) { 
        return e.time < events_[0].time; 
      }).concat(events_.filter( function(e) {
        if ( e.type == 'score' ) return scores[e.id] = e.score, false;
        if ( e.type == 'endgame' ) return endGame(), false;
        return true;
      })); 
    },
    draw : draw
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
  game = GameControl();
  view = ViewControl();
  game.onUpdate( view.update );

  window.onkeydown = handleKeyDown;
  window.onkeyup = handleKeyUp;
}

function handleKey( f ) {
  return function( event ) {
    event = event || window.event;
    var code = event.keyCode || event.which;
    return f(code) !== false;
  }
}

var keysDown = {};
var handleKeyDown = handleKey( function( code ) {
  if (keysDown[code]) return false;
  var handler = { 
    74:[game.playerLeftDown,2], 76:[game.playerRightDown,2], 73:[game.playerJumpStart,2],
    65:[game.playerLeftDown,1], 68:[game.playerRightDown,1], 87:[game.playerJumpStart,1]
   }[code];
  if ( handler ) {
    keysDown[code] = true;
    return handler[0]('player-'+handler[1]), false;
  }
} );

var handleKeyUp = handleKey( function( code ) { 
  var handler = { 
    74:[game.playerKeyUp,2], 76:[game.playerKeyUp,2], 73:[game.playerJumpEnd,2],
    65:[game.playerKeyUp,1], 68:[game.playerKeyUp,1], 87:[game.playerJumpEnd,1] 
    }[code];
  if ( handler ) {
    delete keysDown[code];
    return handler[0]('player-'+handler[1]), false;
  }
} );

window.onload = init;
