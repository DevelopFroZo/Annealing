"use strict";

module.exports = index;

const {
  writeFile: fsWriteFile,
  access: fsAccess
} = require( "fs" );
const execFile = require( "child_process" ).execFile;
const { Router } = require( "express" );
const multer = require( "multer" );

const upload = multer();

function writeFile( path, data ){
  return new Promise( ( res, rej ) => {
    fsWriteFile( path, data, err => {
      if( err ) rej( err );
      else res();
    } );
  } );
}

function access( path ){
  return new Promise( res => {
    fsAccess( path, err => {
      if( err ) res( false );
      else res( true );
    } );
  } );
}

async function uploadHandler( { file, body: { rewrite } }, res ){
  if( file === undefined )
    return res.status( 400 ).json( { status: 400, message: "Invalid file" } );

  if( rewrite !== "true" && await access( `cpp/files/${file.originalname}` ) )
    return res.status( 400 ).json( { status: 400, message: `File already exists (${file.originalname})` } );

  await writeFile( `cpp/files/${file.originalname}`, file.buffer );

  res.sendStatus( 204 );
}

async function annealingHandler( { query: { file, Tmax, Tmin, N, k } }, res ){
  Tmax = parseInt( Tmax );
  Tmin = parseInt( Tmin );
  N = parseInt( N );
  k = parseInt( k );

  if(
    typeof file !== "string" || file === "" ||
    isNaN( Tmax ) ||
    isNaN( Tmin ) ||
    isNaN( N ) || N < 1 ||
    isNaN( k ) || k < 1
  ) return res.status( 400 ).json( { status: 400, message: "Missing required field" } );

  if( !( await access( `cpp/files/${file}` ) ) )
    return res.status( 400 ).json( { status: 400, message: `File not found (${file})` } );

  execFile( "cpp/Annealing.exe", [ `cpp/files/${file}`, Tmin, Tmax, N, k ], ( err, stdout ) => {
    let [ path, pathLength ] = stdout.split( "\n" );

    path = path.split( " " ).map( el => parseInt( el ) );
    pathLength = parseInt( pathLength );

    res.json( { path, pathLength } );
  } );
}

function index( server ){
  const router = new Router();

  router.post( "/upload", upload.single( "file" ), uploadHandler );
  router.get( "/annealing", annealingHandler );

  server.use( router );
}
