"use strict";

module.exports = annealing;

function shuffle( array ){
  for( let i = array.length - 1; i > 0; i-- ){
    const j = Math.floor( Math.random() * ( i + 1 ) );

    [ array[i], array[j] ] = [ array[j], array[i] ];
  }
}

function pathLength( data, path ){
  let res = 0;

  for( let i = 1; i < path.length; i++ ){
    let v0 = path[ i - 1 ];
    let v1 = path[i];

    if( v0 > v1 ) [ v0, v1 ] = [ v1, v0 ];

    res += data[ v0 ][ v1 - v0 - 1 ]
  }

  return res;
}

function annealing( data, Tmin, Tmax, N, callback ){
  let oldPath = Array.from( Array( data.length + 1 ).keys() );

  shuffle( oldPath );

  let oldPathLength = pathLength( data, oldPath );
  let minPath = oldPathLength;

  callback( "init", oldPath, minPath, Tmax, 0 )

  for( let i = 0; i < N; i++ ){
    const Ti = Tmax - i * ( ( Tmax - Tmin ) / N );

    if( Ti <= Tmin ) break;

    const newPath = [ ...oldPath ];

    shuffle( newPath );

    const newPathLength = pathLength( data, newPath );

    oldPathLength = pathLength( data, oldPath );
    
    const delta = newPathLength - oldPathLength;

    if( delta <= 0 || Math.exp( -delta / Ti ) >= Math.random() ){
      minPath = newPathLength;
      oldPath = [ ...newPath ];
    }

    callback( "process", oldPath, minPath, Ti, i + 1 );
  }

  callback( "end", oldPath, minPath, 0, N );
}
