$( document ).foundation();

var $bar = $( '#loading .meter' );
var lastPercent = 0;

function startLoad( showProgress, message ){
  var $loading = $( '#loading' );
  var $message = $loading.find( '.progress-region' );
  
  if( showProgress ){
    $( '#loading .progress' ).show();
    $bar.css({
      width: 0
    });    
  } else {
    $( '#loading .progress' ).hide();
  }
  
  if( message ){
    $( '#loading h1' ).html( message );
  }
  
  $loading.show();
  var left = ( $loading.width() - $message.width() ) / 2;
  var top = ( ( $loading.height() - $message.height() ) / 2 ) - ( $message.height() / 2 );
  
  $message.css({
    position: 'absolute',
    left: left,
    top: top    
  });
}

function endLoad(){
  $( '#loading' ).hide(); 
  $( '#loading h1' ).html( 'Loading&hellip;' );
  lastPercent = 0;
}

function inputChanged(){
  $( '#generate' ).toggleClass( 'disabled', $( '#input' ).val().length === 0 );
}

function progress( i, count ){  
  var percent = ~~( ( i * 100 ) / count );   
  if( percent > lastPercent + 2 ) {  
    $bar.css({
      width: ( ( i / count ) * 100 ) + '%'
    });
    lastPercent = percent;
  }
}

function loadSample(){
  startLoad();
  
  $.get( "samples/pg2591.txt", function( data ) {
    $( '#input' ).text( data );
    $( '#generate' ).removeClass( 'disabled' );
    endLoad();
  }, 'text' );
}

function ensureValue( $element ){
  var def = $element.attr( 'data-default' ) * 1;
  var min = $element.attr( 'min' ) * 1;
  var max = $element.attr( 'max' ) * 1;
  var value = ( $element.val() || def ) * 1;
  value = value < min ? min : value > max ? max : value;
  $element.val( value );
  return value;
}

$( function(){   
  $( '#file' ).hide();
  
  $( '#input' ).on( 'change keyup input', inputChanged );
  $( '#length, #depth' ).on( 'change', function(){
    ensureValue( $( this ) );
  });
  
  loadSample();
  
  $( '#clear' ).click( function(){
    $( '#input' ).text( '' );
    $( '#generate' ).addClass( 'disabled' );
    return false;
  });
  
  $( '#sample' ).click( function(){
    $( '#input' ).text( '' );
    loadSample();
    return false;
  });  
  
  $( '#load' ).click( function(){
    $( '#file' ).click();
    return false;
  });
  
  $( '#file' ).on( 'change', function () {    
    var file = this.files[ 0 ];
    var reader = new FileReader();
    startLoad();

    reader.onload = function () {
      $( '#input' ).text( reader.result );
      $( '#generate' ).click();
      endLoad();
    };

    reader.readAsText( file );
  });

  var input, chain, lastDepth;
  $( '#generate' ).click( function(){
    if( $( this ).hasClass( 'disabled' ) ){
      return;
    }
    
    var length = ensureValue( $( '#length' ) );
    var depth = ensureValue( $( '#depth' ) );
    
    var current = $( '#input' ).val();
    var startOnUpper = $( '#startOnUpper' ).prop( 'checked' );
    var endOnPunc = $( '#endOnPunc' ).prop( 'checked' );
    
    var generate = function(){
      if( input.length > 1 ){
        startLoad();
        $( '#output' ).text( chain.generate( length, startOnUpper, endOnPunc ) );
        endLoad();
      }        
    };
    
    if( current !== input || depth !== lastDepth ){
      startLoad( true, 'Generating Corpus&hellip;' );
      new ChainOfFoo( current, depth, function( chainOfFoo ){
        input = current;
        lastDepth = depth;
        chain = chainOfFoo;
        endLoad();  
        generate();              
      }, progress );
    } else {
      generate();
    };
    return false;
  });
});