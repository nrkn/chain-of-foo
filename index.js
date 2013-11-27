var _ = require( 'underscore' );

(function(){
  'use strict';
  
  function ChainOfFoo( text ){
    this.text = text;
    this.words = split( text );
    this.map = map( this.words );
  }

  var seperator = '\u241E';
  var regexs = {
    uppercase: /[A-Z]/,
    word: /[\w\']+/,
    toBeFollowedBySpace: /[\.\?\),:!;%]/,
    seperatorOrWhitespace: new RegExp( seperator + '|\s' ),
    terminator: /[\.\?!]/
  };
  
  _.mixin({
    flatMap: function( obj, iterator, context ){
      return _( obj ).chain().map( iterator, context ).flatten().value();
    },
    isWord: function( value ){
      return regexs.word.test( value );
    },
    setFlags: function( regex, flags ){
      return new RegExp( regex.source, flags );
    },
    capture: function( regex, flags ){
      return new RegExp( '(' + regex.source + ')', flags );
    },
    spaceAfterPunctuation: function( value ){
      return value.replace( _( regexs.toBeFollowedBySpace ).setFlags( 'g' ), function( c ){ 
        return c + ' '; 
      });
    },
    spaceBeforePunctuation: function( value ){
      return value.replace( /\(/g, ' (' );
    }
  });
  
  ChainOfFoo.prototype.generate = function( length, startUpper, endOnPunc ){    
    length = length || 50;
    length = length < 1 ? 1 : length;
    var self = this;
    var chain = '';
    var last;
    
    var starts = _( self.map ).keys();
    
    if( startUpper ){
      var uppers = _( starts ).filter( function( word ){
        var c = word[ 0 ];
        return regexs.uppercase.test( c );
      });
      if( uppers.length > 0 ){
        starts = uppers;
      }
    }
    
    var current = _( starts ).sample();
    
    chain += current;
    length--;
    
    var hasEnded = false;
    
    while( !hasEnded ){
      length--;
      var atEnd = length < 1;
      var nexts = self.map[ current ];
      if( _( nexts ).isArray() && nexts.length > 0 ){              
        current = _( nexts ).sample();
        //if we should be ending, if possible bias the selection 
        //towards words that are near the end of a sentence.
        if( atEnd && endOnPunc ){          
          //try to only get the nexts that are terminators
          var possible = _( nexts ).filter( function( next ){
            return regexs.terminator.test( next );
          });
          
          //maybe none of the nexts were terminators?
          if( possible.length === 0 ){
            //see if any of the nexts themselves have terminator children
            possible = _( nexts ).filter( function( next ){
              return _( self.map[ next ] ).filter( function( next ){
                return regexs.terminator.test( next );
              });
            });
          }
          
          //only if we have a terminator or a child with a terminator
          if( possible.length > 0 ){
            current = _( possible ).sample();
          }
        } 
        
        chain += ( _( current ).isWord() && _( last ).isWord() ? ' ' : '' ) + current;
        last = current;
      }      
      
      if( endOnPunc ){
        hasEnded = atEnd && regexs.terminator.test( current );
      } else {
        hasEnded = atEnd;
      }
    }
    return _( chain ).chain().spaceAfterPunctuation().spaceBeforePunctuation().value();
  };

  
  
  function split( text ){
    var seperated = text.replace( _( regexs.word ).setFlags( 'g' ), function( word ){
      return word + seperator;
    });
    
    var split = seperated.split( /\u241E|\s/ );    
    return ( 
      _( split )
      .chain()
      .flatMap( function( word ){
        return word.split( _( regexs.word ).capture( 'g' ) );
      })
      .flatMap( function( word ){
        if( _( word ).isWord() ){
          return word;
        }
        return word.split( '' );
      })
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