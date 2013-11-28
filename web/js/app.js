$( document ).foundation();

function startLoad(){
  var $loading = $( '#loading' );
  var $message = $loading.find( 'h1' );
  
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
}

function inputChanged(){
  $( '#generate' ).toggleClass( 'disabled', $( '#input' ).val().length === 0 );
}

$( function(){   
  startLoad();
  
  $.get( "samples/pg2591.txt", function( data ) {
    $( '#input' ).text( data );
    $( '#generate' ).click(); 
    endLoad();
  }, 'text' );
  
  $( '#file' ).hide();
  
  $( '#input' ).on( 'change keyup input', inputChanged );
  
  $( '#clear' ).click( function(){
    $( '#input' ).text( '' );
    $( '#generate' ).addClass( 'disabled' );
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

  var input, chain;
  $( '#generate' ).click( function(){
    if( $( this ).hasClass( 'disabled' ) ){
      return;
    }
    
    var length = $( '#length' ).val() || 20;
    
    var current = $( '#input' ).val();
    var startOnUpper = $( '#startOnUpper' ).prop( 'checked' );
    var endOnPunc = $( '#endOnPunc' ).prop( 'checked' );
    if( current !== input ){
      startLoad();
      chain = new ChainOfFoo( current );
      input = current;
      endLoad();
    };
    
    if( input.length > 1 ){
      startLoad();
      $( '#output' ).text( chain.generate( length, startOnUpper, endOnPunc ) );
      endLoad();
    }
    return false;
  });
});