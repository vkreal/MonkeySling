/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

var PubSub = {};
(function(p){
    "use strict";
    
    p.version = "1.0.1";
    
    var messages = {};
    var lastUid = -1;
    
    var publish = function( message, args, sync ){
        // if there are no subscribers to this message, just return here
        if ( !messages.hasOwnProperty( message ) ){
            return false;
        }
        var deliverMessage = function(){
            var subscribers = messages[message];
            var throwException = function(e){
                return function(){
                    throw e;
                };
            }; 
            for ( var i = 0, j = subscribers.length; i < j; i++ ){
//                try {
                    var o =  subscribers[i].scope || window;
                    subscribers[i].func.apply(o, args );
//                } catch( e ){
//                    setTimeout( throwException(e), 0);
//                }
            }
        };
        
        //if ( sync === true ){
            deliverMessage();
        //} else {
        //    setTimeout( deliverMessage, 0 );
        //}
        return true;
    };

    /**
     *  PubSub.publish( message[, data] ) -> Boolean
     *  - message (String): The message to publish
     *  - sync (Boolean): Forces publication to be syncronous, which is more confusing, but faster
     *  Publishes the the message, passing the data to it's subscribers
    **/
    p.publish = function( message ){
         var args = []; // empty array 
        // copy all other arguments we want to "pass through" 
        for(var i = 1; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
        return publish( message, args, false );
    };
    
    /**
     *  PubSub.publishSync( message[, data] ) -> Boolean
     *  - message (String): The message to publish
     *  - sync (Boolean): Forces publication to be syncronous, which is more confusing, but faster
     *  Publishes the the message synchronously, passing the data to it's subscribers
    **/
    p.publishSync = function( message ){
        var args = []; // empty array 
        // copy all other arguments we want to "pass through" 
        for(var i = 3; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
        return publish( message, args, true );
    };

    /**
     *  PubSub.subscribe( message, func ) -> String
     *  - message (String): The message to subscribe to
     *  - func (Function): The function to call when a new message is published
     *  Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
    **/
    p.subscribe = function( message, scope, func ){
        // message is not registered yet
        if ( !messages.hasOwnProperty( message ) ){
            messages[message] = [];
        }
        
        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'messages' object
        var token = (++lastUid).toString();
        messages[message].push( { token : token, scope:scope, func : func } );
        
        // return token for unsubscribing
        return token;
    };

     /**
     *  PubSub.unsubscribe( token ) -> String | Boolean
     *  - token (String): The token of the function to unsubscribe
     *  Unsubscribes a specific subscriber from a specific message using the unique token
    **/
    p.unsubscribe = function( token ){
        for ( var m in messages ){
            if ( messages.hasOwnProperty( m ) ){
                for ( var i = 0, j = messages[m].length; i < j; i++ ){
                    if ( messages[m][i].token === token ){
                        messages[m].splice( i, 1 );
                        return token;
                    }
                }
            }
        }
        return false;
    };
    // keep api name from closure compiler
    window['PubSub'] = p;
    p['publish'] = p.publish;
    p['subscribe'] = p.subscribe;
    p['unsubscribe'] = p.unsubscribe;
}(PubSub));