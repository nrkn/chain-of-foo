var ChainOfFoo = require( './index' );
var fs = require( 'fs' );

fs.readFile( './temp/cleaned.txt', 'utf-8', function( err, text ){
  if( err ) throw err;
  
  var complete = function( chain ){
    console.log( chain.generate( 15, true, true ) );
  };
  
  var lastPercent = 0;
  var progress = function( i, count ){
    var percent = ~~( ( i * 100 ) / count );   
    if( percent > lastPercent + 1 ) {  
      console.log( percent + '%' );
      lastPercent = percent;
    }  
  }
  
  new ChainOfFoo( text, 3, complete, progress );  
});