"use strict";

// Imports
const sirv = require( "sirv" );
const express = require( "express" );
const compression = require( "compression" );
const bodyParser = require( "body-parser" );

// Config, database
require( "./configs/env" );

// Helpers
const routes = require( "./routes" );

// Consts
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const server = express();

// Settings
server.use(
  bodyParser.json(),
  bodyParser.urlencoded( {
    extended: true
  } ),
  compression( {
    threshold: 0
  } )
);

// Role control
routes( server );

// Run
server
  .use(
    sirv( "static", {
      dev
    } )
  )
  .listen( PORT, err => {
  	if( err ) console.log( "error", err );
    else console.log( `Server runned on ${PORT} port!` );
  } );
