"use strict";

module.exports = index;

const api = require( "./api" );

function index( server ){
  server.use( "/api", api );
}
