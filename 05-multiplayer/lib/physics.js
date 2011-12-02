var container = (typeof exports == undefined ? window : exports );

/*
Given a list of objects, each with accelerations, velocities, and coordinates,
solve for for all non-balistic changes in trajectory including collisions, drops, 
key press starts, and key press ends.
The Physics object updates every time an object is added or removed, an impulse is made, or
simply when asked (it should be asked periodiocally). An update is a series of events. The first
event contains the state of all boxes at time 0. Each subsequent event contains the state of all
boxes that have changed trajectory.  The final event contains the state of all boxes at a given
time, T. Clients may either use the data to compute the exact trajectory provided by this object,
or discard the first position and velocity and use the existing position to calculate a new velocity
given the next position and current acceleration.
*/
container.Physics = function( g, f ) {
  // TODO: Make sure concurrent events aren't skipped
  // TODO: Remove unchanged events from calculations.  
  var current_state={}, current_t=0, alterations=[];

  function update( start, dt ) {
    try {
      var events = [], evt = { t:current_t, state:current_state, cause:{type:'start'}}, 
          end = start + dt, seen = {};

      // skip ahead to state at t
      while ( evt.t < start )
        evt = next_event( evt.state, evt.t, start, alterations, seen );
      current_state = evt.state;
      current_t = start;

      // add all events till end
      evt.cause.type = 'start';
      events.push( simplify_event( evt ) );
      var tempAlterations = alterations.slice(0)
      while ( evt.t < end )
        events.push( simplify_event( evt = next_event( evt.state, evt.t, end, tempAlterations, seen ) ) );

      return events;
    } catch ( error ) { console.log( error ); }
  }

  function simplify_event( event ) {
    var out = { time:event.t, type:event.cause.type, first:event.cause.b1 };
    if ( out.type in {start:1, end:1} ) {
      out.altered = simplify_box_state(event.state);
    } else if ( out.type == 'remove' ) {
      out.altered = {};
      out.altered[event.cause.b1] = {};
    } else {
      var state = {};
      if ( out.type == 'remove' ) state[event.cause.b1] = {id:event.cause.b1};
      if (event.cause.b1) state[event.cause.b1] = event.state[event.cause.b1];
      if (event.cause.b2) state[event.cause.b2] = event.state[event.cause.b2];      
      out.altered = simplify_box_state( state );
    }
    return out;
  }

  function simplify_box_state( boxes ) {
    var out = {}, box;
    for ( var id in boxes ) {
      box = boxes[id];
      out[id] = { id:box.id, x:box.x, y:box.y, height:box.h, width:box.w, vx:box.vx, vy:box.vy, 
                  ax:xforce(box), ay:yforce(box), fixed:box.fixed, resting:box.resting };
    }
    return out;
  }

  function next_event( state, start, end, alterations, seen ) {
    var collision = next_collision( state, start, alterations, seen );

    if ( ! collision || start + collision.t > end )
      return { t:end, state:project( state, start, end ), cause:{type:'end'} };

    var next_state = project( state, start, start+collision.t );
    if ( collision.type == 'lr' || collision.type == 'rl' )
      horizontalCollision( next_state[collision.b1], next_state[collision.b2] );
    else if ( collision.type == 'tb' || collision.type == 'bt' )
      verticalCollision( next_state[collision.b1], next_state[collision.b2] );
    else if ( collision.type == 'dr' || collision.type == 'dl' )
      next_state[collision.b1].resting = null;
    else if ( collision.type == 'alteration' ) {
      var alteration = alterations.splice(0,1)[0], altered = next_state[alteration.id];
      if (altered) for (var key in alteration.properties) altered[key] = alteration.properties[key];
    } else if ( collision.type == 'add' ) {
      var alteration = alterations.splice(0,1)[0];
      next_state[alteration.id] = alteration.properties;
    } else if ( collision.type == 'remove' ) {
      var alteration = alterations.splice(0,1)[0];
      delete next_state[alteration.id];
    }
    sanitize(next_state);
    return { t:start+collision.t, state:next_state, cause:collision };
  }

  function horizontalCollision( b1, b2 ) {
    if ( b1.fixed ) return b2.vx = -b2.vx;
    if ( b2.fixed ) return b1.vx = -b1.vx;
    var m1 = b1.w*b1.h, m2=b2.w*b2.h, b1v=b1.vx, b2v=b2.vx;
    b1.vx = (b1v*(m1-m2) + 2*m2*b2v) / (m1+m2);
    b2.vx = (b2v*(m2-m1) + 2*m1*b1v) / (m1+m2);
  }

  function verticalCollision( b1, b2 ) {
    if ( b1.fixed || b1.resting ) return land( b2, b1 );
    if ( b2.fixed || b2.resting ) return land( b1, b2 );
    var m1 = b1.w*b1.h, m2=b2.w*b2.h, b1v=b1.vy, b2v=b2.vy;
    b1.vy = (b1v*(m1-m2) + 2*m2*b2v) / (m1+m2);
    b2.vy = (b2v*(m2-m1) + 2*m1*b1v) / (m1+m2);
  }

  function land( b1, b2 ) {
    if ( b1.y < b2.y || b2.resting ) return b1.vy = -b1.vy;
    b1.vy = 0; b1.resting = b2.id;        
  }

  function project( state, start, end ) {
    var next_state={}, b, dt=end - start;
    for ( var id in state ) {
      b = state[id];
      var fx = xforce(b), fy = yforce(b);
      next_state[id] = b.fixed ? b : { id:id, w:b.w, h:b.h, ax:b.ax, ay:b.ay, friction:b.friction,
        x:fx*dt*dt/2 + b.vx*dt + b.x, vx:fx*dt + b.vx, 
        y:fy*dt*dt/2 + b.vy*dt + b.y, vy:fy*dt + b.vy,
        resting:b.resting, maxVx:b.maxVx, maxVy:b.maxVy };
    }
    return next_state;
  }

  function xforce(box) {
    if ( box.fixed) return 0;
    var xforce = box.resting && box.friction && Math.abs(box.vx) > .001 ? (box.vx > 0 ? -f : f) + box.ax : box.ax
    return ( box.maxVx && Math.abs(box.vx) >= box.maxVx && box.vx*xforce > 0 ) ? 0 : xforce;
  }

  function yforce(box) {
    if ( box.fixed) return 0;
    var yforce = box.resting ? Math.max(box.ay+g,0) : g + box.ay;
    return ( box.maxVy && Math.abs(box.vy) >= box.maxVy && box.vy*yforce > 0 ) ? 0 : yforce;
  }

  function next_collision( state, start, alterations, existing ) {
    var potential_events=[], collision, seen={}, b1, b2, tb, times, t, fx, fy, mx, my;
    for (var id1 in state) {
      if ( state[id1].fixed ) continue;
      seen[id1] = true;
      b1 = state[id1];

      fx = xforce(b1); mx = fx > 0 ? b1.maxVx : -b1.maxVx; t = (mx-b1.vx)/fx;
      if ( mx && fx && future_event(existing,'maxvx',t,b1.id) ) 
        potential_events.push( {t:t, type:'maxvx', b1:b1.id} );

      fy = yforce(b1); my = fy > 0 ? b1.maxVy : -b1.maxVy; t = (my-b1.vy)/fy;
      if ( my && fy && future_event(existing,'maxvy',t,b1.id) ) 
        potential_events.push( {t:t, type:'maxvy', b1:b1.id} );

      if ( b1.resting && b1.friction && b1.vx ) {
        t = -b1.vx/xforce(b1);
        if ( future_event(existing,'s',t,b1.id) ) potential_events.push( {t:t, type:'s', b1:b1.id} );
      }

      for (var id2 in state) {
        if ( ! seen[id2] ) {
          times = {};
          b2 = state[id2];

          if ( b1.resting == b2.id ) droptest( b1, b2, times );
          else if ( b2.resting == b1.id ) tb=b1, b1=b2, b2=tb, droptest( b1, b2, times );
          else collide(b1,b2,times);

          collision = bestTime( times, b1, b2 );
          if ( collision && future_event(existing,collision.type,collision.t,b1.id,b2.id) ) 
            potential_events.push( collision );
        }
      }
    }
    if ( alterations.length ) {
      var a = alterations[0];      
      potential_events.push({type:a.type, t:a.t-start, b1:a.id, properties:a.properties});
    }
    if ( ! potential_events.length )
    return null;      
    var evt = potential_events.sort(function(e1,e2) { return e1.t - e2.t; })[0];
    existing[event_key(evt.type,evt.b1,evt.b2)] = evt.t;
    return evt;
  }

  function future_event(seen,type,t,id1,id2) {
    if ( t < -0.00001 ) return false;
    var time = seen[event_key(type,id1,id2)];
    return time === undefined || Math.abs(time-t) > 0.00001;
  }
  function event_key(type,id1,id2) { return type+'-'+id1+(id2?'-'+id2:''); }

  function collide(b1,b2,times) {
    times.lr = segment_collide( b1, b2, 0 );
    times.rl = segment_collide( b1, b2, 1 );
    times.bt = segment_collide( b1, b2, 2 );
    times.tb = segment_collide( b1, b2, 3 );
  }

  function droptest( b1, b2, times ) {
    times.dr = segment_collide( b1, b2, 0, true );
    times.dl = segment_collide( b1, b2, 1, true );
  }

  function bestTime( times, b1, b2 ) {
    var best, bestType;
    for ( var type in times )
      if ( times[type] != null && times[type] > -0.00001 && (best == null || times[type] < best)) best=times[type], bestType=type;
    if ( bestType ) 
      return { t:best, type:bestType, b1:b1.id, b2:(b2||{}).id }
  }

  function segment_collide( b1, b2, type, oneD ) {
    var a = type<2 ? (xforce(b1)-xforce(b2))/2 : (yforce(b1)-yforce(b2))/2,
        b= type<2 ? b1.vx-b2.vx : b1.vy-b2.vy, 
        c = type<2 ? (type==0 ? b1.x-b2.x-b2.w : b1.x+b1.w-b2.x) : (type==2 ? b1.y-b2.y-b2.h : b1.y+b1.h-b2.y), 
        det = b*b - 4*a*c;
    var valid = oneD ? valid_time : valid_collision;
    if (a == 0) return b == 0 ? null : valid( -c/b, b1, b2, type );
    if ( det < 0 ) return null; det = Math.sqrt(det);
    var t1 = valid((-b + det)/(2*a), b1, b2, type), 
        t2 = valid((-b - det)/(2*a), b1, b2, type);
    return t1>-0.00001 && t2>-0.00001 ? Math.min(t1,t2) : t1>-0.00001 ? t1 : t2>=-0.00001 ? t2 : null;
  }

  function valid_time( t ) { return t < -0.00001 ? -1 : t;  }

  function valid_collision( t, b1, b2, type ) {
    if ( t < -0.000001 ) return -1;
    if ( type == 0 &&  (xforce(b2)*t+b2.vx) - (xforce(b1)*t+b1.vx) <= 0 ) return -1;
    if ( type == 1 &&  (xforce(b1)*t+b1.vx) - (xforce(b2)*t+b2.vx) <= 0 ) return -1;
    if ( type == 2 &&  (yforce(b2)*t+b2.vy) - (yforce(b1)*t+b1.vy) <= 0 ) return -1;
    if ( type == 3 &&  (yforce(b1)*t+b1.vy) - (yforce(b2)*t+b2.vy) <= 0 ) return -1;
    if ( type < 2 ) {
      var y1 = yforce(b1)*t*t/2 + b1.vy*t + b1.y, y2 = yforce(b2)*t*t/2 + b2.vy*t + b2.y;
      return (y1<=y2+b2.h && y1>=y2) || (y2<=y1+b1.h && y2>=y1) ? t : -1;
    } 
    var x1 = xforce(b1)*t*t + b1.vx*t + b1.x, x2 = xforce(b2)*t*t + b2.vx*t + b2.x;
    return (x1<=x2+b2.w && x1>=x2) || (x2<=x1+b1.w && x2>=x1) ? t : -1;
  }

  function sanitize( state ) {
    for ( var id in state ) {
      var box = state[id];
      if ( box.resting ) {
        if ( ! (box.resting in state) || box.vy )
          box.resting = null;            
        if ( Math.abs(box.vx) < .00001 ) box.vx = 0;
      }
    }
  }

  return {
    /* x, y, width, height, vx, vy, friction, maxVx, maxVy */
    addBox: function( time, id, o ) {
      alterations.push( {t:Math.max(current_t,time), type:'add', id:id, properties:{
                           id:id, x:o.x||0, y:o.y||0, w:o.width, h:o.height, vx:o.vx||0, vy:o.vy||0, 
                           ax:o.ax||0, ay:o.ay||0, friction:o.friction!==false, maxVx:o.maxVx||0, maxVy:o.maxVy||0 } } );
      alterations.sort( function(a1,a2) { return a1.t-a2.t; });
    },
    /* x, y, width, height */
    addFixture: function( time, id, o ) {
      alterations.push( {t:Math.max(current_t,time), type:'add', id:id, properties:{
                            id:id, x:o.x, y:o.y, w:o.width, h:o.height, vx:0, vy:0, ax:0, ay:0, fixed:true, friction:true } } );
      alterations.sort( function(a1,a2) { return a1.t-a2.t; })
    },
    removeFeature: function( time, id ) {
      alterations.push( {t:Math.max(current_t,time), type:'remove', id:id } );
      alterations.sort( function(a1,a2) { return a1.t-a2.t; })
    },
    alter: function( time, id, properties, alterationKey ) {
      for (var i=0,a; a=alterations[i]; i++) if (a.key&&a.key==alterationKey)
        return a.time = time, a.properties=properties;
      alterations.push( {t:Math.max(current_t,time), type:'alteration', id:id, properties:properties, key:alterationKey} )
      alterations.sort( function(a1,a2) { return a1.t-a2.t; });
    },
    currentState: function( time ) {
      var progress = update( current_t, time-current_t );
      return progress[progress.length-1].altered;
    },
    update: update
  }
}
