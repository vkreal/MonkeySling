(function () {
    VK.CAAT = VK.CAAT || {};


    VK.CAAT.Resources = [
        { id: 'particle', url: VK.APPLICATION_ROOT + 'assets/ingame/particle.png' }
        , { id: 'stars', url: VK.APPLICATION_ROOT + 'assets/ingame/stars.png' }
        , { id: 'stars2', url: VK.APPLICATION_ROOT + 'assets/ingame/stars2.png' }
        , { id: 'smoke', url: VK.APPLICATION_ROOT + 'assets/ingame/smoke.png' }
        , { id: 'balls', url: VK.APPLICATION_ROOT + 'assets/ingame/balls.png' }
        , { id: 'numbers', url: VK.APPLICATION_ROOT + 'assets/ingame/numbers.png' }
        , { id: 'numberssmall', url: VK.APPLICATION_ROOT + 'assets/ingame/numbers_s.png' }
        , { id: 'scoreboard', url: VK.APPLICATION_ROOT + 'assets/ingame/scoreboard.png' }
    ];

    for (var jj = 0; jj < VK.CAAT.Resources.length; jj++) {
        VK.CAAT.Resources[jj].url = VK.CAAT.Resources[jj].url + '?' + VK.BUST_CACHE;
    }

    /**
    * This actor draws stars.
    *
    * @constructor
    * @extends CAAT.Actor
    */
    var starsImage = null;
    var particlesImage = null;
    var initSprite = function (director) {
        if (starsImage == null) {// create a sprite image of 1 row by 6 columns
            starsImage = new CAAT.SpriteImage().initialize(director.getImage('stars'), 1, 6);
        }
        if (particlesImage == null) {// create a sprite image of 1 row by 6 columns
            particlesImage = new CAAT.SpriteImage().initialize(director.getImage('particle'), 1, 6);
        }
    };

    VK.CAAT.StarActor = function () {
        VK.CAAT.StarActor.superclass.constructor.call(this);
        return this;
    };

    VK.CAAT.StarActor.prototype = {
        initialize: function (director, directorScene, point) {
            initSprite(director);
            var T = 2500;
            // set background image to be a reference of a SpriteImage instance
            // and set actor's size equal to a SpriteImage's subimage size
            this.setBackgroundImage(
                    starsImage.getRef(), true).
            // set background as a random SpriteImage's subimage.
                setSpriteIndex((Math.random() * 6) >> 0).
            // center the actor on mouse position
                centerOn(point.x, point.y).
            // when the actor expires, remove in from the director
                setDiscardable(true).
            // avoid mouse event handling.
                enableEvents(false).
            // make this actor last to T milliseconds (1000)
                setFrameTime(directorScene.time, T).
            // add a scaling behavior
                addBehavior(
                    new CAAT.ScaleBehavior().
                        setFrameTime(directorScene.time, T).
                        setValues(1, 5, 1, 5).
                        setInterpolator(
                            new CAAT.Interpolator().createExponentialInInterpolator(
                                3,
                                false)
                        ).setValueApplication(false)
                ).
            // add an alpha behavior so the actor takes 1000 ms to fade out to zero alpha
                addBehavior(
                    new CAAT.AlphaBehavior().
                        setFrameTime(directorScene.time, T).
                        setValues(1, 0));
            return this;
        }
    };
    extend(VK.CAAT.StarActor, CAAT.Actor, null);


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    var actorCache = {};

    var createActorCache = function (director, type) {
        var spriteImage = type == 'star' ? starsImage : particlesImage;
        if (!actorCache[type]) {
            actorCache[type] = [];
            for (var i = 0; i < 400; i++) {
                var actor = new CAAT.Actor().
                setBackgroundImage(spriteImage.getRef(), true).
                setSpriteIndex((Math.random() * 6) >> 0).
                enableEvents(false).
                setOutOfFrameTime();
                actorCache[type].push(actor);
            }
        }
    };

    /**
    * This actor draws falling stars or particles.
    *
    * @constructor
    * @extends CAAT.ActorContainer
    */
    VK.CAAT.FallingStarsActorContainer = function () {
        VK.CAAT.FallingStarsActorContainer.superclass.constructor.call(this);
        this.m__type = 'star';
        return this;
    };

    VK.CAAT.FallingStarsActorContainer.prototype = {
        starCacheIndex: 0,
        initialize: function (director, directorScene, point) {
            initSprite(director);
            createActorCache(director, this.m__type);
            this.setBounds(0, 0, director.width, director.height);
            this.directorScene = directorScene;
            this.director = director;
            return this;
        },
        activateBehavior: function (target) {
            var NS = 20;
            for (var i = 0; i < NS; i++) {
                var star = actorCache[this.m__type][(i + this.starCacheIndex++) % actorCache[this.m__type].length];

                var x = target.x// + target.width / 2;
                var y = target.y// + target.height / 2;
                var sgnX = (Math.random() < .5 ? 1 : -1);
                var sgnY = (Math.random() < .5 ? 1 : -1);
                var cpx = x + (20 + Math.random() * 80) * sgnX;
                var cpy = y + (20 + Math.random() * 40) * sgnY;

                var fpy = this.director.height + (50 * Math.random());
                var fpx = cpx + (80 * Math.random()) * sgnX;

                star.emptyBehaviorList().
                                    addBehavior(
                                            new CAAT.PathBehavior().
                                                    setFrameTime(this.directorScene.time, 600 + (400 * Math.random())).
                                                    setPath(
                                                            new CAAT.Path().
                                                                    beginPath(x, y).
                                                                    addQuadricTo(cpx, cpy, fpx, fpy).
                                                                    endPath()
                                                    ).
                                                    addListener({
                                                        behaviorExpired: function (behavior, time, actor) {
                                                            actor.setExpired(true);
                                                        }
                                                    })
                                            ).
                                    setDiscardable(true).
                                    setFrameTime(this.directorScene.time, Number.MAX_VALUE);

                this.addChild(star);
            }
        }
    };
    extend(VK.CAAT.FallingStarsActorContainer, CAAT.ActorContainer, null);


    /**
    * This actor draws falling particles.
    *
    * @constructor
    * @extends VK.CAAT.FallingStarsActorContainer
    */
    VK.CAAT.FallingParticlesActorContainer = function () {
        VK.CAAT.FallingParticlesActorContainer.superclass.constructor.call(this);
        this.m__type = 'particle';
        return this;
    };
    extend(VK.CAAT.FallingParticlesActorContainer, VK.CAAT.FallingStarsActorContainer, null);

})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {
   /**
    * This actor draws stars.
    *
    * @constructor
    * @extends CAAT.Actor
    */
    var starsImage = null;
    var initSprite = function (director) {
        if (starsImage == null) {// create a sprite image of 1 row by 6 columns
            starsImage= new CAAT.SpriteImage().initialize(director.getImage('stars2'), 24,6 );
        }
    };

    var createCachedStar = function(director, directorScene) {
        var iindex= (Math.random()* starsImage.columns)>>0;
        var actor= new CAAT.Actor();
        actor.__imageIndex= iindex;
        actor.
            setBackgroundImage( starsImage.getRef().setAnimationImageIndex( [iindex] ), true ).
            enableEvents(false).
            setDiscardable(true).
            setOutOfFrameTime().
            addBehavior(
                new CAAT.GenericBehavior().
                    setValues( 1, .1, null, null, function(value,target,actor) {
                        actor.backgroundImage.setAnimationImageIndex( [
                            actor.__imageIndex+(23-((23*value)>>0))*actor.backgroundImage.getColumns()
                        ] );
                    }).
                    setId('__alpha') );
        return actor;
    };
    
    var createSelectionStarCache =  function(director, directorScene) {
        var actor= createCachedStar();

        var trb=
            new CAAT.PathBehavior().
                setFrameTime(directorScene.time,0).
                setPath(
                    new CAAT.LinearPath().
                        setInitialPosition(0,0).
                        setFinalPosition(0,0)
                ).
                setInterpolator(
                    new CAAT.Interpolator().createExponentialOutInterpolator(
                        2,
                        false)
                );
        actor.__trb= trb;
        actor.addBehavior(trb);

        var ab= null;
        ab= new CAAT.GenericBehavior().
                setValues( 1, .1, null, null, function(value,target,actor) {
                    actor.backgroundImage.setAnimationImageIndex( [
                            actor.__imageIndex+(23-((23*value)>>0))*actor.backgroundImage.getColumns()
                        ] );
                });
        
        actor.__ab= ab;
        actor.addBehavior(ab);


        return actor;
    };
    var selectionStarCache = null, fallingStarCache = null;

    var create_cache = function(particleContainer, director, directorScene) {
        // TODO: MAYBE PERF BOTTLE SWITCHING DIRECTOR AND SCENE WE SHOULD TRY TO RESUSE OBJECTS
        //if(!selectionStarCache) {
            selectionStarCache = [];
            var i,actor;
            for( i=0; i<32*4; i++ ) {
                actor= createSelectionStarCache(director, directorScene);
                actor.addListener( {
                    actorLifeCycleEvent : function(actor, event, time) {
                        if (event === 'destroyed') {
                            selectionStarCache.push(actor);
                        }
                    }
                });
                actor.__parent= particleContainer;
                selectionStarCache.push(actor);
            }
       //}
    };
    /**
    * Creates star particles.
    *
    * @constructor
    * @extends CAAT.ActorContainer
    *
    */
    VK.CAAT.ParticleStarContainerActor = function () {
        VK.CAAT.ParticleStarContainerActor.superclass.constructor.call(this);
        return this;
    };

    VK.CAAT.ParticleStarContainerActor.prototype = {
        initialize: function (director, directorScene, point) {
            initSprite(director);
            this.setBounds(0,0,director.width, director.height);
            //this.setBounds(0, 0, point.w, point.h);
            //this.setBounds(point.x, point.y, point.w, point.h);
            this.enableEvents(false);
            create_cache(this, director, directorScene);
            this.directorScene = directorScene;
            return this;
        },
        activateBehavior : function(target) {
            var me= this;
            
            if ( target ) {
                var x0= target.x//+target.width/2-starsImage.singleWidth/2;
                var y0= target.y//+target.height/2-starsImage.singleHeight/2;
                var R= Math.sqrt( target.width*target.width + target.height*target.height )/2;
                var N= 16;
                var i;
                var rad= Math.PI/N*2;
                var T= target.time||300;
                
                for( i=0; i<N; i++ ) {
                    var x1= x0+ R*Math.cos( i*rad );
                    var y1= y0+ R*Math.sin( i*rad );

                    if ( selectionStarCache.length ) {
                        var actor=  selectionStarCache.shift();
                        actor.setFrameTime(this.directorScene.time, T);
                        actor.backgroundImage.setAnimationImageIndex( [(Math.random()*6)>>0] );
                        actor.__trb.setFrameTime(this.directorScene.time, T);
                        actor.__trb.path.setInitialPosition(x0,y0).setFinalPosition(x1,y1);
                        actor.__ab.setFrameTime(this.directorScene.time, T);

                        actor.__parent.addChild(actor);
                    }
                }
            }
        }
    };
    extend(VK.CAAT.ParticleStarContainerActor, CAAT.ActorContainer, null);

})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {
    /**
    * This actor draws smoke.
    *
    * @constructor
    * @extends CAAT.Actor
    */
    var smokeImage = null;
    var initSprite = function (director) {
        if (smokeImage == null) {// create a sprite image of 1 row by 6 columns
            smokeImage= new CAAT.SpriteImage().initialize(director.getImage('smoke'), 32,1 );
        }
    };

    VK.CAAT.SmokeActor = function () {
        VK.CAAT.SmokeActor.superclass.constructor.call(this);
        return this;
    };

    VK.CAAT.SmokeActor.prototype = {
        smokeTime: 1000,
        initialize: function (director, directorScene, point) {
            initSprite(director);
            
            var offset0 = Math.random() * 10 * (Math.random() < .5 ? 1 : -1);
            var offset1 = Math.random() * 10 * (Math.random() < .5 ? 1 : -1);
            
            this.setBackgroundImage(smokeImage.getRef().setAnimationImageIndex([0])).
            setLocation(
                offset0 + point.x /*+ point.width / 2 */ - smokeImage.singleWidth / 2,
                offset1 + point.y /*+ point.height / 2 */ - smokeImage.singleHeight / 2).
            setDiscardable(true).
            enableEvents(false).
            setFrameTime(directorScene.time, this.smokeTime);
            
//            this.addBehavior(
//                new CAAT.ScaleBehavior().
//                    setFrameTime(directorScene.time, this.smokeTime).
//                    setValues(.5, 1.5, .5, 1.5));
            

            this.addBehavior(
                    new CAAT.ScaleBehavior().
                        setFrameTime(directorScene.time, this.smokeTime).
                        setValues(.1, .1, .1, .1).
                        setInterpolator(
                            new CAAT.Interpolator().createExponentialInInterpolator(
                                3,
                                false)
                        ).setValueApplication(false)
                );

            this.addBehavior(
                new CAAT.GenericBehavior().
                    setFrameTime(directorScene.time, this.smokeTime).
                    setValues(1, 0, null, null, function(value, target, actor) {
                        var v= 31 - ((value * 31) >> 0);
                        if ( v!==actor.backgroundImage.animationImageIndex[0] ) {
                            actor.setAnimationImageIndex([v]);
                        }
                    })
            );


            return this;
        }
    };
    extend(VK.CAAT.SmokeActor, CAAT.Actor, null);

})();