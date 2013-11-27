$( document ).foundation();

$( function(){     
  $( '#file' ).on( 'change', function () {
    var file = this.files[ 0 ];
    var reader = new FileReader();

    reader.onload = function () {
      $( '#file-input textarea' ).text( reader.result );
    };

    reader.readAsText( file );
  });

  var input, chain;
  $( '#generate' ).click( function(){
    var length = $( '#length' ).val() || 20;
    
    var current = $('.tabs-content .active textarea').val();
    var startOnUpper = $( '#startOnUpper' ).prop( 'checked' );
    var endOnPunc = $( '#endOnPunc' ).prop( 'checked' );
    if( current !== input ){
      chain = new ChainOfFoo( current );
      input = current;
    };
    
    if( input.length > 1 ){
      $( '#output' ).text( chain.generate( length, startOnUpper, endOnPunc ) );
    }
    return false;
  });
});