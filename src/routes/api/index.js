"use strict";

const { Router } = require( "express" );
const annealing = require( "../../helpers/annealing" );

const router = new Router();

module.exports = router;

function annealingHandler( {
  body: { data, Tmin, Tmax, N }
}, res ){
  annealing( data, Tmin, Tmax, N, ( e, path, pathLength ) => {
    if( e === "end" ) res.json( { path, pathLength } );
  } );
}

router.post( "/annealing", annealingHandler );
