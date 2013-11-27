var ChainOfFoo = require( './index' );
var fs = require( 'fs' );

fs.readFile( './pg76.txt', 'utf-8', function( err, text ){
  if( err ) throw err;
  
  var chain = new ChainOfFoo( text );
  console.log( chain.generate( 20, true, true ) );
});