"use strict";
let q = [];
let N;

function rotatePoint( turn_, turnAround, angel ){
  let turn, turned;

  turn = [ ...turn_ ];
  turned = [];
  angel *= Math.PI / 180;
  turn[0] -= turnAround[0];
  turn[1] -= turnAround[1];
  turned.push( turn[0] * Math.cos( angel ) - turn[1] * Math.sin( angel ) );
  turned.push( turn[0] * Math.sin( angel ) + turn[1] * Math.cos( angel ) );
  turned[0] += turnAround[0];
  turned[1] += turnAround[1];

  return turned;
}

class Graph{
  constructor( el ){
    this.el = el;
    this.width = el.offsetWidth;
    this.height = el.offsetHeight;
    this.paper = new Raphael( el, this.width, this.height );
  }

  drawPoints( n ){
    const angle = 360 / n;
    const center = [ this.width / 2, this.height / 2 ];
    const point = [ this.width / 2, 100 ];

    this.paper.clear();
    this.rotatedPoints = [];

    for( let i = 0; i < 360; i += angle )
      this.rotatedPoints.push( rotatePoint( point, center, i ) );

    for( let [ i, point ] of Object.entries( this.rotatedPoints ) ){
      this.paper.circle( point[0], point[1], 10 ).attr( {
          "stroke" : "#0062cc"
      } );
      this.paper.text( point[0], point[1], i ).attr( {
        "font-size" : "18px",
        "fill" : "#0062cc",
        "stroke" : null
     } );
    }
  }

  drawLine( path ){
    let st = "M";

    if( this.path !== undefined )
      this.path.remove();

    for( let [ i, el ] of Object.entries( path ) ){
      st += this.rotatedPoints[ el ];

      if( i < path.length - 1 ) st += "L";
    }

    this.path = this.paper.path( st ).attr( {
      "stroke" : "#0062cc"
  } );
  }
}

class Chart{
  constructor( el, maxPathLength, maxN ){
    this.el = el;
    this.width = el.offsetWidth;
    this.height = el.offsetHeight;
    this.paper = new Raphael( el, this.width, this.height );
    this.maxPathLength = maxPathLength;
    this.maxN = maxN;
  }

  init( pathLength, i ){
    this.paper.clear();

    this.oldPoint = [
      this.width / this.maxN * i,
      this.height - this.height / this.maxPathLength * pathLength
    ];
  }

  drawLine( pathLength, i ){
    const newPoint = [
      this.width / this.maxN * i,
      this.height - this.height / this.maxPathLength * pathLength
    ];

    this.paper.path(
      `M${this.oldPoint[0]},${this.oldPoint[1]}
      L${newPoint[0]},${newPoint[1]}`
    ).attr( {
      "stroke" : "#0062cc"
  } );

    this.oldPoint = newPoint;
  }
}

function getMaxSum( data ){
  let sum = 0;
  let gmax = 0;

  for( let line of data ){
    let max = 0;

    for( let el of line )
      max = el > max ? el : max;

    sum += max;
    gmax = max > gmax ? max : gmax;
  }

  sum += gmax;

  return sum;
}

function index(){
  const note = document.getElementById( "note" );
  // const graph = new Graph( note );

  // document.getElementById( "btn" ).addEventListener( "click", go );

  // socket.on( "/api/annealing", data => {
  //   const { event: e, path, pathLength, i } = JSON.parse( data );

  //   if( e === "init" ) chart.init( pathLength, i );
  //   else chart.drawLine( pathLength, i );

  //   if( e === "end" ) console.log( `path: ${path}, pathLength: ${pathLength}` );
  // } );

  q = [
    [ 1, 2, 2, 2 ],
    [ 1, 2, 2 ],
    [ 1, 2 ],
    [ 2 ]
  ];
  N = 100;
  const max = getMaxSum( q );
  // const chart = new Chart( note, max, N );

  // Generator
  // for( let i = 0; i < 9; i++ ){
  //   const w = [];
  //
  //   for( let j = i + 1; j < 10; j++ )
  //     w.push( Math.floor( Math.random() * 10 ) + 1 );
  //
  //   q.push( w );
  // }
}

window.addEventListener( "load", index );
