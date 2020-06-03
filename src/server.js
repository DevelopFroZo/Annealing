"use strict";

// Imports
const sirv = require( "sirv" );
const express = require( "express" );
const httpModule = require( "http" );
const ioModule = require( "socket.io" );
const compression = require( "compression" );
const bodyParser = require( "body-parser" );

// Config, database
require( "./configs/env" );

// Helpers
const socket = require( "./socket" );

// Consts
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const app = express();
const http = httpModule.createServer( app );
const io = ioModule( http );

// Settings
app.use(
  bodyParser.json(),
  bodyParser.urlencoded( {
    extended: true
  } ),
  compression( {
    threshold: 0
  } )
);

// Socket
socket( io );

// Run
app.use(
  sirv( "static", {
    dev
  } )
);

http.listen( PORT, err => {
	if( err ) console.log( "error", err );
  else console.log( `Server runned on ${PORT} port!` );
} );
