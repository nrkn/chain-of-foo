var _ = require( 'underscore' );

(function(){
  'use strict';
  
  function ChainOfFoo( text ){
    this.text = text;
    this.words = split( text );
    this.map = map( this.words );
  }

  ChainOfFoo.prototype.generate = function( length, startUpper, endOnPunc ){    
    length = length || 50;
    length = length < 1 ? 1 : length;
    var chain = '';
    var last;
    
    var starts = _( this.map ).keys();
    
    if( startUpper ){
      var uppers = _( starts ).filter( function( word ){
        var c = word[ 0 ];
        return /[A-Z]/.test( c );
      });
      if( uppers.length > 0 ){
        starts = uppers;
      }
    }
    
    var current = _( starts ).sample();
    
    chain += current;
    length--;
    while( length > 0 ){
      var nexts = this.map[ current ];
      if( _( nexts ).isArray() ){      
        current = _( nexts ).sample();
        chain += ( /[\w\']+/.test( current ) && /[\w\']+/.test( last ) ? ' ' : '' ) + current;
        last = current;
      }      
      length--;
    }
    return chain.replace( /[\.\?\),:!;%]/g, function( c ){ return c + ' '; } ).replace( /\(/g, ' (' );
  };

  var seperator = '\u241E';
  
  function split( text ){
    var seperated = text.replace( /[\w\']+/g, function( word ){
      return word + '\u241E';
    });
    
    var split = seperated.split( /\u241E|\s/ );
    
    return ( 
      _( split ).chain()
      .map( function( word ){
        return word.split( /([\w\']+)/g );
      })
      .flatten()
      .map( function( word ){
        if( /[\w\']+/.test( word ) ){
          return word;
        }
        return word.split( '' );
      })
      .flatten()
      .filter( function( word ){
        return word !== '';
      })
      .value()
    );
  }
  
  function map( words ){
    var mapping = {};
    _( words ).each( function( word, i ){
      if( i < words.length - 1 ){
        var next = words[ i + 1 ];
        if( !_( mapping ).has( word ) ){
          mapping[ word ] = [ next ];
        } else {
          mapping[ word ].push( next );
        }
      }
    });
    return mapping;
  }
  
  module.exports = ChainOfFoo;
})();  