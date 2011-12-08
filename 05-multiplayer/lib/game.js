var physics = require('./physics');
var highscores = require('./highscores');

exports.init = function(io) {
  var games = {};

  var gameSockets = io.of('/game').on('connection', function(socket) {
    socket.on('tick', function() { socket.emit('tock',new Date().getTime()) });
    socket.on('join', function(data) {
      var room = socket.join( data.gameId );

      var game = games[data.gameId] = (games[data.gameId] || GameControl(data.gameId, gameSockets));
      game.join( data.nickname, data.isHost );


      function keyEvent(f) { return function() { f( data.isHost ? 'player-1' : 'player-2' ); } };
      socket.on('playerLeftDown', keyEvent(game.playerLeftDown) );
      socket.on('playerRightDown', keyEvent(game.playerRightDown) );
      socket.on('playerJumpStart', keyEvent(game.playerJumpStart) );
      socket.on('playerKeyUp', keyEvent(game.playerKeyUp) );
      socket.on('playerJumpEnd', keyEvent(game.playerJumpEnd) );
    });
  });
};

function GameControl( gameId, sockets ) {
  var PLATFORM_WIDTH = 20, LEVEL_SPACING = 95;
  var PLATFORMS = [[-20,PLATFORM_WIDTH,640],
                   [0,LEVEL_SPACING+PLATFORM_WIDTH,220],
                   [380,LEVEL_SPACING+PLATFORM_WIDTH,220],
                   [150,2*LEVEL_SPACING+PLATFORM_WIDTH,300],
                   [0,3*LEVEL_SPACING+PLATFORM_WIDTH,220],
                   [380,3*LEVEL_SPACING+PLATFORM_WIDTH,220]];

  var engine = physics.Physics( -4000, 4000 ),
      time = new Date().getTime()/1000,
      state,
      coinIndex=0,
      timers = [],
      scores={'player-1':0, 'player-2':0},
      nicknames = {},
      misses=0,
      gameOver = false,
      player1Available = false,
      player2Available = false,
      physicsTimer,
      coinTimer;

  function startGame() {
    gameEvent('startGame', true);
    PLATFORMS.forEach( function(p,i) { engine.addFixture( time, 'platform-'+i, {
        x:p[0], y:p[1]-PLATFORM_WIDTH, width:p[2], height:PLATFORM_WIDTH } ) } );
    engine.addFixture( time, 'wall-right', {x:-5, y:LEVEL_SPACING, width:5, height:700} );
    engine.addFixture( time, 'wall-left', {x:600, y:LEVEL_SPACING, width:5, height:700} );
    engine.addFixture( time, 'tunnel-left', {x:-25, y:0, width:5, height:LEVEL_SPACING} );
    engine.addFixture( time, 'tunnel-right', {x:620, y:0, width:5, height:LEVEL_SPACING} );

    engine.addBox( time, 'player-1', {x:0, y:PLATFORM_WIDTH + 5, width:30, height:30, maxVx:400, maxVy:400} );
    engine.addBox( time, 'player-2', {x:570, y:PLATFORM_WIDTH + 5, width:30, height:30, maxVx:400, maxVy:400} );

    physicsTimer = setInterval( update, 1000 );
    setTimeout( update, 5 );
    coinTimer = setTimeout( dropCoin, 3000);
  }

  function dropCoin() {
    var speed = 100 + (300 * Math.random())|0;
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
    gameEvent( 'score', { score:scores[player], id:player } );
    engine.removeFeature( evt.time-.001, coin );
    if ( scores[player] >= 5 )
      endGame();
    return update();
  }

  function handleUnderBounce( evt ) {
    var bouncer = evt.altered[evt.first], 
        bounced = engine.currentState()[evt.first=='player-1'?'player-2':'player-1'];
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
    gameEvent('score', {score:scores[bounced.id], id:bounced.id });
  }

  function handleCoinExit( evt ) {
    var coin;
    for ( var id in evt.altered )
      if ( id.match(/^coin-/) ) coin = id;
    engine.removeFeature( evt.time-.001, coin );
    return update();
  }

  function endGame() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    clearTimeout(coinTimer);
    clearInterval(physicsTimer);
    gameOver = true;
    gameEvent( 'gameover', true );
    if (scores['player-1'] > scores['player-2'] )
      highscores.win( nicknames['player-1'], onSave );
    else 
      highscores.win( nicknames['player-2'], onSave );
    function onSave(err) {
      if ( err ) console.log( err );
    }
  }

  function update() {
    if ( gameOver ) return;
    state = engine.update( setTime()-.5, 2 );

    timers.forEach(clearTimeout);
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

    gameEvent( 'update', state );
  }

  function stateFor(id) {
    var time = setTime(), boxState;
    for ( var i=0, event; (event=state[i]) && event.time <= time; i++ ) {
      boxState = event.altered[id] || boxState;
    }
    return boxState || {};
  }

  function newPlayer( nickname, isHost ) {
    if ( isHost ) {
      nicknames['player-1'] = nickname;
      player1Available = true;
    } else {
      nicknames['player-2'] = nickname;
      player2Available = true;
    }
    gameEvent('joined',  {nickname:nickname, isHost:isHost, nicknames:nicknames} );
    if ( player1Available && player2Available ) {
      gameEvent( 'prepare', 3000 );
      setTimeout( startGame, 3000 );
    }
  }

  function gameEvent( type, data ) {
    sockets.to(gameId).emit( type, data );
  }

  return {
    playerLeftDown: function(player) { engine.alter( setTime(), player, {ax:-1000, friction:false} ); update(); },
    playerRightDown: function(player) { engine.alter( setTime(), player, {ax:1000, friction:false} ); update(); },
    playerKeyUp: function(player) { engine.alter( setTime(), player, {ax:0, friction:true} ); update(); },
    playerJumpStart: function(player) { if (stateFor(player).resting) engine.alter( setTime(), player, {vy:800, ay:1500} ); update(); },
    playerJumpEnd: function(player) { engine.alter( setTime(), player, {ay:0} ); update(); },
    join: newPlayer
  }
}
