var ChainOfFoo = require( './index' );
var fs = require( 'fs' );

fs.readFile( './pg76.txt', 'utf-8', function( err, text ){
  if( err ) throw err;
  
  var complete = function( chain ){
    console.log( chain.generate( 20, true, true ) );
    console.log( chain.generate( 20, true, true ) );
    console.log( chain.generate( 20, true, true ) );
    console.log( chain.generate( 20, true, true ) );
    console.log( chain.generate( 20, true, true ) );
    console.log( chain.generate( 20, true, true ) );
  };
  
  var progress = function( i, count ){
  }
  
  new ChainOfFoo( text, 3, complete, progress );  
});