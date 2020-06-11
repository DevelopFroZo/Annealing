"use strict";
let q = [];
let N;
// let strokeColor = "#0062cc"
let strokeColor = "#000000"

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
          "stroke" : strokeColor
      } );
      this.paper.text( point[0], point[1], i ).attr( {
        "font-size" : "18px",
        "fill" : strokeColor,
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
      "stroke" : strokeColor
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
      "stroke" : strokeColor
  } );

    this.oldPoint = newPoint;
  }
}

class Chart2{
  constructor( el ){
    this.el = el;
    this.width = el.offsetWidth;
    this.height = el.offsetHeight;
    this.paper = new Raphael( el, this.width, this.height );
  }

  draw( pathLengths ){
    let min = null;
    let max = null;

    this.paper.clear();

    for( let pathLength of pathLengths ){
      if( min === null || pathLength < min ) min = pathLength;
      if( max === null || pathLength > max ) max = pathLength;
    }

    const delta = max - min;
    let path = "M";

    for( let [ i, pathLength ] of Object.entries( pathLengths ) ){
      const x = 10 + ( this.width - 20 ) / ( pathLengths.length - 1 ) * i;
      const y = this.height - 10 - ( this.height - 20 ) / delta * ( pathLength - min );

      path += `${x},${y}`;

      if( i < pathLengths.length - 1 )
        path += "L";
    }

    this.paper.path( path ).attr( {
      "stroke" : strokeColor
    } );
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
