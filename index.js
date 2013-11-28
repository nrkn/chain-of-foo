var _ = require( 'underscore' );

(function(){
  'use strict';
  
  function ChainOfFoo( text, depth, callback, progress ){
    depth = depth || 1;
    
    var self = this;
    this.times = [];    
    var time = this.time = function( name ){
      var current = _( self.times ).find( function( time ){ return time.name === name; } );
      if( _( current ).isUndefined() ){
        current = {
          name: name,
          time: 0          
        };
        self.times.push( current );
      }
      current.start = Date.now();
    };
    var end = this.end = function( name ){
      var current = _( self.times ).find( function( time ){ return time.name === name; } );
      var now = Date.now();
      current.end = now;
      current.time += now - current.start;
    };   
    this.logTimes = function(){
      _( _( self.times ).sortBy( function( time ){ return time.time; } ) ).each( function( time ){
        console.log( time.time + ' / ' + time.name );
      });
    };
    
    this.time( 'total' );
    
    this.depth = depth;    
    this.progress = progress;
    this.callback = callback;
    this.map = {};
    this.text = text;
    time( 'split' );
    this.words = split( text );
    end( 'split' );
    this.mapCorpus();
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
    var result = '';
    var nextWord;
    var lastWord;
    
    if( self.words.length < 2 ){      
      if( self.words.length === 0 ){
        return '';
      }
      return self.words[ 0 ];
    }    
    
    var startIds = _( self.map ).keys();
    
    if( startUpper ){
      var upperIds = _( startIds ).filter( function( word ){
        var c = word[ 0 ];
        return regexs.uppercase.test( c );
      });
      if( upperIds.length > 0 ){
        startIds = upperIds;
      }
    }
    
    var currentId = _( startIds ).sample();
    var words = currentId.split( seperator );
    var text = words.join( ' ' );
    
    result += text;
    length--;
    
    var hasEnded = false;
    var atEnd = false;
    while( !hasEnded ){            
      var nexts = self.map[ currentId ];
      if( _( nexts ).isUndefined() ){
        hasEnded = true;
      }
      if( _( nexts ).isArray() && nexts.length > 0 ){              
        nextWord = _( nexts ).sample();
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
            nextWord = _( possible ).sample();
          }
        } 
        
        result += ( _( nextWord ).isWord() && _( lastWord ).isWord() ? ' ' : '' ) + nextWord;
        lastWord = nextWord;
        currentId = currentId.split( seperator ).slice( 1 ).concat( nextWord ).join( seperator );
        if( _( nextWord ).isWord() ){
          length--;
        }        
        atEnd = length < 1;
      }      
      
      if( !hasEnded ){
        if( endOnPunc ){
          hasEnded = atEnd && regexs.terminator.test( nextWord );
        } else {
          hasEnded = atEnd;
        }
      }
    }
    return _( result ).chain().spaceAfterPunctuation().spaceBeforePunctuation().value();
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
  
  function mapWord( context, mapping, word, i ){
    var prefix = [];    
    context.time( 'mapWord' );
    for( var j = 0; j < context.depth; j++ ){          
      var index = i + j;
      if( index < context.words.length - 1 ){
        prefix.push( context.words[ index ] );
      }
    }
    var identifier = prefix.join( seperator );
    if( i < context.words.length - 1 ){
      var next = context.words[ i + context.depth ];        
      if( !_( mapping ).has( identifier ) ){
        mapping[ identifier ] = [ next ];
      } else {
        mapping[ identifier ].push( next );
      }        
    }
    context.end( 'mapWord' );
  }

  ChainOfFoo.prototype.mapCorpus = function(){
    var context = this;
    var mapping = {};
    
    var timerId;
    var i = 0;
    context.time( 'mapCorpus' );
    function delayWord(){
      mapWord( context, mapping, context.words[ i ], i );
      if( _( context.progress ).isFunction() ){
        context.progress( i, context.words.length );
      }        
      i++;
      if( i < context.words.length ){
        timerId = setImmediate( delayWord );
      } else {     
        clearImmediate( timerId );
        context.map = mapping;
        context.end( 'mapCorpus' );
        context.end( 'total' );
        if( _( context.callback ).isFunction() ){
          context.callback( context );
        }
      }
    };
    delayWord();
  };
  
  module.exports = ChainOfFoo;
})();  