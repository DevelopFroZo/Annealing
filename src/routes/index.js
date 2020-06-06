"use strict";

module.exports = index;

const {
  writeFile: fsWriteFile,
  access: fsAccess,
  readdir: fsReaddir,
  stat: fsStat
} = require( "fs" );
const execFile = require( "child_process" ).execFile;
const { Router } = require( "express" );
const multer = require( "multer" );

const upload = multer();
const modes = [ "vector", "parameter", "temperature" ];

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

function readdir( path ){
  return new Promise( ( res, rej ) => {
    fsReaddir( path, ( err, files ) => {
      if( err ) rej( err );
      else res( files );
    } );
  } );
}

function stat( path ){
  return new Promise( ( res, rej ) => {
    fsStat( path, ( err, stats ) => {
      if( err ) rej( err );
      else res( stats );
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

async function annealingHandler( { query: { file, Tmin, Tmax, mode, N, k, saveMinimumState, shuffleCount } }, res ){
  Tmin = parseInt( Tmin );
  Tmax = parseInt( Tmax );
  N = parseInt( N );
  k = parseInt( k );
  shuffleCount = parseInt( shuffleCount );

  if(
    typeof file !== "string" || file === "" ||
    isNaN( Tmin ) ||
    isNaN( Tmax ) ||
    !modes.includes( mode ) ||
    ![ "true", "false" ].includes( saveMinimumState ) ||
    isNaN( N ) || N < 1 ||
    isNaN( k ) || k < 1 ||
    isNaN( shuffleCount ) || shuffleCount < 1
  ) return res.status( 400 ).json( { status: 400, message: "Missing required field" } );

  if( !( await access( `cpp/files/${file}` ) ) )
    return res.status( 400 ).json( { status: 400, message: `File not found (${file})` } );

  execFile( "cpp/Annealing.exe", [ `cpp/files/${file}`, Tmin, Tmax, mode, N, k, saveMinimumState, shuffleCount ], ( err, stdout ) => {
    let [ minPathAndLength, allMinPaths, minPathLengths ] = stdout.split( "\n" );

    minPathAndLength = minPathAndLength.split( " " );

    const minPathLength = parseInt( minPathAndLength.splice( minPathAndLength.length - 1, 1 ) );
    const minPath = minPathAndLength.map( el => parseInt( el ) );

    allMinPaths = allMinPaths.split( " " ).map( el => parseInt( el ) );
    minPathLengths = minPathLengths.split( " " ).map( el => parseInt( el ) );

    res.json( { minPath, minPathLength, allMinPaths, minPathLengths } );
  } );
}

async function filesHandler( req, res ){
  const files = await readdir( "cpp/files" );
  let result = [];

  if( files.length === 0 )
    return res.sendStatus( 204 );

  for( let file of files ){
    const stats = await stat( `cpp/files/${file}` );

    if( stats.isFile() )
      result.push( [ file, stats.birthtimeMs ] );
  }

  if( result.length === 0 )
    return res.sendStatus( 204 );

  result = result
    .sort( ( a, b ) => {
      if( a[1] < b[1] ) return 1;
      if( a[1] > b[1] ) return -1;

      return 0;
    } )
    .map( el => el[0] );

  res.json( { files: result } );
}

function index( server ){
  const router = new Router();

  router.post( "/upload", upload.single( "file" ), uploadHandler );
  router.get( "/annealing", annealingHandler );
  router.get( "/files", filesHandler );

  server.use( router );
}
