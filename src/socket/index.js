"use strict";

module.exports = index;

const annealing = require( "../helpers/annealing" );

function apiAnnealingHandler( body, socket ){
  const { data, Tmin, Tmax, N } = JSON.parse( body );

  annealing( data, Tmin, Tmax, N, ( e, path, pathLength, Ti, i ) => {
    socket.emit( "/api/annealing", JSON.stringify( { event: e, path, pathLength, Ti, i } ) );
  } );
}

function add( socket ){
  socket.on( "/api/annealing", body => apiAnnealingHandler( body, socket ) );

  console.log( socket.id );
}

function index( io ){
  io.on( "connection", add );
}
