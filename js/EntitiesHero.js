/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    // Player
    var WORLD_SCALE = VK.Box2D.WORLD_SCALE;


    VK.InGame.PlayerBall = VK.Entity.extend({
        name: VK.CONSTANT.PLAYER,
        b2Body: null,
        b2Joint: null,
        dampingRatio: VK.Box2D.PLAYER.dampingRatio,
        frequencyHz: VK.Box2D.PLAYER.frequencyHz,
        //monkeyPeg: null,
        radius: 16,
        moveSensorRadius: 60 / 2,
        trail: true,
        m__flying: false, // object is flying from fling
        m__touch: false, // object is in touch
        m__life_time: 1500,
        m__show_mad: false,
        m__timer_startTime: 0,
        canRotate: function () {
            return false;
        },
        // override isPlayer
        isPlayer: function () {
            return true;
        },
        // override allowPointer
        getAllowPointer: function () {
            // only allow pointer/mouse interation with player when linked to peg // game rule!
            return this.islink();
        },
        cancelLifeTimer: function () {
            if (this.lifeTimer) {
                this.lifeTimer.cancel();
                this.lifeTimer = null;
            }
        },
        recreate: function (sfx) {
            this.cancelLifeTimer();
            // PLAYER OBJ IS RESPOSIBLE FOR CREATING NEW PLAYER
            //
            // 1. do some dieing effects //TODO:
            // 2. kill off current player
            // 3. create new player with peg
            var gameState = this.getGameState();
            this.deactivate(sfx, true); // 2
            
            if (gameState.player && gameState.player.active === true || gameState.isLifeDONE()) {
                // somehow we got into a state we are creating another monkey while 
                // one is already in play
                return;
            }
            var x = VK.InGame.lastPeg ? VK.InGame.lastPeg.x : this.x;
            var y = VK.InGame.lastPeg ? VK.InGame.lastPeg.y : this.y;

            var player = new VK.InGame.PlayerBall({ monkeyPeg: VK.InGame.lastPeg, b2World: gameState.b2World, x: x, y: y, frequencyHz: VK.Box2D.PLAYER.frequencyHz, dampingRatio: VK.Box2D.PLAYER.dampingRatio, trail: true });
            gameState.addEntity(player);

            gameState.createTimer(800, function callback_timeout() {
                gameState.centerAroundPlayer();
            });
        },
        sling: function () {
            // TODO: SHOULD TRY AND REUSE JOINT
            if (!this.b2Joint || !this.monkeyPeg) { return; }
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'sling', volume: 40 });
            this._removeJoint();
            var pegB2DPostions = this.monkeyPeg.getB2Position();
            var distanceX = this.b2Body.GetPosition().x * WORLD_SCALE - pegB2DPostions.x * WORLD_SCALE;
            var distanceY = this.b2Body.GetPosition().y * WORLD_SCALE - pegB2DPostions.y * WORLD_SCALE;
            var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            var birdAngle = Math.atan2(distanceY, distanceX);
            this.b2Body.SetLinearVelocity(new b2Vec2(-distance * Math.cos(birdAngle) / 7, -distance * Math.sin(birdAngle) / 8));
            this.m__flying = true;
            // 1. player not on peg after 3 seconds, player considered dead
            // start timer here

            // try to adjust 
            this.m__life_time = jaws.game_loop.fps && jaws.game_loop.fps > 30 ? 1500 : 2500;

            //if (jaws.game_loop.fps > 30) {
            //    this.m__life_time = 1200;
            //}

            this.m__timer_startTime = this.getGameState().getDirectorTime();

             
            this.lifeTimer = this.getGameState().createTimer(this.m__life_time,
                function callback_timeout(time) {
                    var gameState = this.getGameState();

                    if (gameState.isLevelComplete() || !this.b2Body) { return; }


                    //console.debug('y: ' + this.b2Body.GetLinearVelocity().y)
                    var vy = this.b2Body.GetLinearVelocity().y;
                    var vx = this.b2Body.GetLinearVelocity().x;

                    var buffer = 2;

                    //if ((vy > buffer || vy < -buffer) || (vx > buffer || vx < -buffer)) {
                    if (this.b2Body.GetLinearVelocity().y !== 0) {

                        var m = jaws.game_loop.fps && jaws.game_loop.fps > 20 ? 4 : 2;


                        var d = gameState.getDirectorTime() - this.m__timer_startTime;
                        if (d > this.m__life_time * m) {
                            // alive too long, cause maybe by low framerate 
                            // we do this some how his y never hit 0 or never stablized
                            this.recreate();
                        }
                        else {
                            this.lifeTimer.reset(time);
                        }
                    }
                    else {
                        this.recreate();
                    }
                }.bind(this),
                function callback_tick(time, ttime) {
                    //console.debug('time: ' + time);
                    if (this.b2Body && this.b2Body.GetLinearVelocity().y == 0 && (ttime + 600) >= this.m__life_time) {
                        this.m__show_mad = true;
                    }
                }.bind(this),
                function callback_cancel() {
                    this.m__show_mad = false;
                }.bind(this)
            );
        },
        islink: function () {
            return !!this.b2Joint;
        },
        _removeJoint: function () {
            if (this.b2Joint) {
                this.b2World.DestroyJoint(this.b2Joint);
                this.b2Joint = null;
                // remove tail
                var tail = VK.InGame.PlayerBall.getTail();
                this.getGameState().removeEntity(tail);
            }
        },
        _createB2Joint: function () {
            this._removeJoint();
            var jd = new b2DistanceJointDef();
            var p1, p2, d;

            jd.frequencyHz = this.frequencyHz / WORLD_SCALE;
            jd.dampingRatio = this.dampingRatio / WORLD_SCALE;
            //jd.collideConnected = false;
            var pegB2DPostions = this.monkeyPeg.getB2Position();

            jd.bodyA = this.b2World.GetGroundBody();
            jd.bodyB = this.b2Body;
            jd.localAnchorA.Set(pegB2DPostions.x, pegB2DPostions.y);
            jd.localAnchorB.Set(1 / WORLD_SCALE, .5 / WORLD_SCALE);
            p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA);
            p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB);
            //            d = new b2Vec2(p2.x - p1.x, p2.y - p2.y);
            //            jd.length = d.Length();
            this.b2Joint = this.b2World.CreateJoint(jd);

            var tail = VK.InGame.PlayerBall.getTail();
            tail.setTail(this.b2Joint);
            this.getGameState().addEntity(tail);

            // reset timer
            this.cancelLifeTimer();
        },
        createCircleShape: function (radius) {
            var pegB2DPostions = this.monkeyPeg.b2Body.GetPosition();
            var shape = new b2CircleShape(radius / WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(1.5, 2, 0.7);
            fixture.shape = shape;
            var sphereBodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_dynamicBody, pegB2DPostions.x * VK.Box2D.WORLD_SCALE, pegB2DPostions.y * VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this });
            //sphereBodyDef.fixedRotation = true;

            var body = this.b2World.CreateBody(sphereBodyDef);
            body.SetBullet(true);
            body.CreateFixture(fixture);
            return body;
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2(this.x / VK.Box2D.WORLD_SCALE, this.y / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },
        createDesignerSensorBodyDef: function (userData) {
            //console.log('x: ' + this.x + ' y: ' + this.y);
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x), (this.y), userData);
        },
        getToolbarIcon: function () {
            return this.spriteImg;
        },
        init: function (options) {
            this._super(options);
            var frequencyHz = this.frequencyHz,
                dampingRatio = this.dampingRatio,
                b2World = this.b2World;
            this.id = 'monkey-' + (new Date()).getTime();
            this.w = this.radius * 2;
            //this.spriteImg = jaws.assets.get("assets/Capture.png");


            //"monkeys_angry": { "w": 300, "h": 150, "x": 0, "y": 0 },
            //   "monkeys_flying": { "w": 300, "h": 150, "x": 300, "y": 0 },
            //   "monkeys_happy": { "w": 300, "h": 150, "x": 600, "y": 0 },
            //   "monkeys_left": { "w": 300, "h": 150, "x": 900, "y": 0 },
            //   "monkeys_pullback": { "w": 300, "h": 150, "x": 1200, "y": 0 },
            //   "monkeys_right": { "w": 300, "h": 150, "x": 1500, "y": 0 },
            //   "monkeys_sad": {
            //    "w": 300, "h": 150, "x": 1800, "y": 0
            //}

            var size = 72;
            var qs_monkeysize = VK.GameHelper.getUrlParameterByName('monkeysize');
            if (qs_monkeysize) {
                size = parseInt(qs_monkeysize);
            }

            this.radius = size / 4;

            var URL = VK.Canvas.getImageDef("monkeys_right").URL;

            // size * 2 //becuase we have two monkeys on sprite
            var monkeys_right = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_right", size * 2, size);
            var monkeys_left = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_left", size * 2, size);

            this.animRight = new jaws.Animation({ cacheKey: this.name + "animRight", sprite_sheet: monkeys_right, frame_size: [size, size], frame_duration: 2000, bounce: true, orientation: 'right' });
            this.animLeft = new jaws.Animation({ cacheKey: this.name + "animLeft", sprite_sheet: monkeys_left, frame_size: [size, size], frame_duration: 2000, bounce: true, orientation: 'right' });

            var monkeys_pullback = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_pullback", size * 2, size);

            this.pullLeft = VK.Canvas.cutImage3(monkeys_pullback, 0, 0, size, size, "monkeys_pullback_pullLeft");
            this.pullRight = VK.Canvas.cutImage3(monkeys_pullback, size, 0, size, size, "monkeys_pullback_pullRight");


            var monkeys_flying = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_flying", size * 2, size);

            this.flyLeft = VK.Canvas.cutImage3(monkeys_flying, 0, 0, size, size, "monkeys_flying_left");
            this.flyRight = VK.Canvas.cutImage3(monkeys_flying, size, 0, size, size, "monkeys_flying_right");


            var monkeys_angry = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_angry", size * 2, size);

            this.angryLeft = VK.Canvas.cutImage3(monkeys_angry, 0, 0, size, size, "monkeys_angry_left");
            this.angryRight = VK.Canvas.cutImage3(monkeys_angry, size, 0, size, size, "monkeys_angry_right");


            var monkeys_happy = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_happy", size * 2, size);

            this.monkeys_happyLeft = VK.Canvas.cutImage3(monkeys_happy, 0, 0, size, size, "monkeys_happy_left");
            this.monkeys_happyRight = VK.Canvas.cutImage3(monkeys_happy, size, 0, size, size, "monkeys_happy_right");


            this.sprite = new jaws.Sprite({ image: this.animRight.next(), x: this.x, y: this.y });

            this.createDesignerSensorMove();

            if (this.isDesignMode) { return; }

            if (!this.monkeyPeg) {
                this.monkeyPeg = new VK.InGame.Peg({ b2World: this.b2World, x: this.x, y: this.y, scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });
                VK.InGame.firstPeg = this.monkeyPeg;
                this.getGameState().addEntity(this.monkeyPeg);
            }
            VK.InGame.lastPeg = this.monkeyPeg;
            this.frequencyHz = frequencyHz;
            this.dampingRatio = dampingRatio;
            this.b2Body = this.createCircleShape(this.radius, false);

            this._createB2Joint();

            PubSub.subscribe(VK.CONSTANT.EVENT.MOUSEUP, this, this.mouseUp.bind(this));

            this.pegPixelPosition = this.monkeyPeg.getPixelPosition();
            this.playerPointer = new VK.InGame.PlayerPointer({ x: this.getPixelPosition().x - (this.radius * 4), y: this.getPixelPosition().y });
            this.getGameState().getEntities().push(this.playerPointer);

            if (this.trail) {
                this.trailEmitter = new VK.Emitter(
                    0, 0, 		//x, y,
                    0, 0, 		//width, height,
                    0, 0, 		//vx, vy,
                    .2, .2, 	//vxRandom, vyRandom,
                    0, 0, 		//ax, ay,
                    0, 0, 		//axRandom, ayRandom,
                    0, 1, 		//vr, vrRandom,
                    false, 		//physical,
                    1500, 		//maxAge,
                    75, 		//emissionRate,
                    2000, 		//fadeOut,
                    150, 		//maxParticles,
                    120, 142, 254, //startR, startG, startB,
                    100, 200, 255, //endR, endG, endB,
                    8.0, 3.0, 	 //startS, endS		
                    1.5  // radius
                );
                // The trail emitter is always on.
                this.trailEmitter.activate(null);
            }


            this.impactEmitter = new VK.Emitter(
                0, 0, 		//x, y,
                0, 0, 		//width, height,
                0, 0, 		//vx, vy,
                5, 5, 		//vxRandom, vyRandom,
                0, 0, 		//ax, ay,
                0, 0, 		//axRandom, ayRandom,
                0, 0, 		//vr, vrRandom,
                false, 		//physical,
                200, 		//maxAge,
                20, 		//emissionRate,
                100, 		//fadeOut,
                300, 		//maxParticles,
                255, 255, 0, //startR, startG, startB,
                255, 0, 0, //endR, endG, endB,
                1.5, .1 	 //startS, endS		
            );


            this._super();
        },
        mouseUp: function (options) { // TODO: FIXED TIS 
            var sling = options.sling,
                selectedBody = options.selectedBody;

            if (sling && selectedBody && selectedBody.GetUserData() && selectedBody.GetUserData().Entity == this) {
                this.sling();
            }
        },
        //touchend: function (e, b2Body, MouseJoint) {
        //    if (MouseJoint && b2Body && b2Body.GetUserData() && b2Body.GetUserData().Entity == this) {
        //        this.sling();
        //    }
        //},
        touchstart: function (e, b2Body) {
            if (b2Body === this.b2Body) {
                this.m__touch = true;
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'streched', volume: 60 });
               
                this.slingStart = {
                    sx: this.sprite.x,
                    sy: this.sprite.y
                };
                
            }
        },
        touchend: function () {
            this.m__touch = false;
            if (this.slingStart) {
                this.slingStart.ex = this.sprite.x;
                this.slingStart.ey = this.sprite.y;
            }
        },
        touchmove: function (e) {
            var gameState = this.getGameState();
            //me.INPUT.isMouseDown = { x: me.INPUT.mouseX, y: me.INPUT.mouseY, bodyAtPointer: bodyAtPointer }
            if (this.playerPointer && gameState.INPUT.isMouseDown && gameState.INPUT.isMouseDown.bodyAtPointer) {
                this.playerPointer.destroy();
                this.playerPointer = null;
                //gameState.playSound('streched');
            }
        },
        endContact: function (contact) {
            var body = this._getBodyFromContact(contact);
            if (!body) { return; }
            var userData = body.GetUserData();

            // allow to swing back to same peg when havent hitch to another
            if (userData && userData.Name == VK.CONSTANT.PEG &&
                userData.Entity == this.monkeyPeg && this.b2Joint == null) {
                this.monkeyPeg = null;
            }
        },
        _getBodyFromContact: function (contact) {
            var fixtureB = null;
            if (!(fixtureB = contact.GetFixtureB())) {
                return undefined;
            }
            return fixtureB.GetBody()
        },
        beginContact: function (contact) {
            if (contact && this.m__flying && !contact.IsSensor()) {
                this.m__flying = false;
            }
            var body = this._getBodyFromContact(contact);
            var userDataA = contact.GetFixtureA().GetBody().GetUserData();
            // return if instance is not same as current
            if (!body || !userDataA || userDataA.Entity != this) { return; }
            var userData = body.GetUserData();

            if (userData && userData.Entity != this.monkeyPeg) {
                switch (userData.Name) {
                    case VK.CONSTANT.PEG:
                        this.monkeyPeg = userData.Entity;
                        VK.InGame.lastPeg = this.monkeyPeg;
                        this.pegPixelPosition = this.monkeyPeg.getPixelPosition();
                        this.m__flying = false;
                        //PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'catch_peg', volume: 40 });
                        this._createB2Joint();
                        break;
                }
                if (userData.Entity.isFital()) {
                    if (this.active === true) {
                        if (this.islink() && VK.InGame.firstPeg) {
                            // bring back to first peg
                            VK.InGame.lastPeg = VK.InGame.firstPeg;
                        }
                        this.deactivate(true, false);

                        var gs = this.getGameState();
                        var me = this;
                        gs.createTimer(800, function () {
                            gs.execOnUpdate(function () {
                                me.recreate(false);
                            });
                        });
                    }
                    this.active = false;
                }
            }
        },
        destroy: function () {
            if (this.playerPointer) {
                this.playerPointer.destroy();
                this.playerPointer = null;
            }
            this._removeJoint();
            this._super();
        },
        update: function (timeDelta) {
            if (this.trailEmitter) {
                if (this.islink()) {
                    this.trailEmitter.active = false;
                }
                else {
                    this.trailEmitter.active = true;
                }
                this.trailEmitter.x = this.sprite.x;
                this.trailEmitter.y = this.sprite.y;
                this.trailEmitter.update(timeDelta);
            }

            if (this.impactEmitter) {
                this.impactEmitter.x = this.sprite.x;
                this.impactEmitter.y = this.sprite.y;
                this.impactEmitter.update(timeDelta);
            }

            this._super();

            //console.debug('touch ' + (this.touch == true ? 'true' : 'false'));
            if (!this.isDesignMode) {

                if (this.getGameState().isLevelComplete()) {
                    if (this.b2Body.GetLinearVelocity().x < 0.5) {
                        this.sprite.setImage(this.monkeys_happyLeft);
                    }
                    else {
                        this.sprite.setImage(this.monkeys_happyRight);
                    }
                }
                else if (this.m__show_mad) {
                    // about to die mad
                    if (this.b2Body.GetLinearVelocity().x < 0.5) {

                        this.sprite.setImage(this.angryLeft);

                    }
                    else {

                        this.sprite.setImage(this.angryRight);
                    }

                }
                else if (this.m__flying) {

                    if (this.b2Body.GetLinearVelocity().x < 0.5) {

                        this.sprite.setImage(this.flyLeft);

                    }
                    else {

                        this.sprite.setImage(this.flyRight);
                    }
                }
                else {

                    if (this.m__touch == true && this.islink()) {
                        if (this.getPixelPosition().x < this.pegPixelPosition.x) {
                            this.sprite.setImage(this.pullRight);
                        }
                        else {
                            this.sprite.setImage(this.pullLeft);
                        }

                    }
                    else {
                        //console.debug('not pulling')
                        //console.debug('stopped: ' + this.b2Body.GetLinearVelocity().x)
                        var vX = this.islink() ? -2.2 : 0.5;

                        if (this.b2Body.GetLinearVelocity().x < vX) {

                            this.sprite.setImage(this.animLeft.next());

                        }
                        else {

                            this.sprite.setImage(this.animRight.next());
                        }
                    }

                }
                //else {
                //    if (this.b2Body.GetLinearVelocity().x < 0) {

                //        this.sprite.setImage(this.angryLeft);

                //    }
                //    else {

                //        this.sprite.setImage(this.angryRight);
                //    }
                //}
            }
            //if (this.islink()) {
            //    this.sprite.image = jaws.assets.get("assets/Capture.png")
            //}
            //else {
            //    this.sprite.image = jaws.assets.get("assets/Capture2.png")
            //}

            //this.spriteLeftImg = VK.Canvas.cutImage2("Neutral 1 - face left");
            //this.spriteRightImg = VK.Canvas.cutImage2("Neutral 1 - face right");




            /*
            if (typeof window.N_XXX == 'undefined') {
                window.N_XXX = this.b2Body.GetLinearVelocity().x;
            }
            if (typeof window.P_XXX == 'undefined') {
                window.P_XXX = this.b2Body.GetLinearVelocity().x;
            }

            if (window.P_XXX < this.b2Body.GetLinearVelocity().x) {
                window.P_XXX = this.b2Body.GetLinearVelocity().x;
            }
        
            if (window.N_XXX > this.b2Body.GetLinearVelocity().x) {
                window.N_XXX = this.b2Body.GetLinearVelocity().x;
            }

            console.debug('GetLinearVelocity N X: ' + window.P_XXX + ' P X: ' + window.N_XXX);

            */
            //console.debug('AngularVelocity: ' + this.b2Body.GetAngularVelocity());

            //            this.b2Body.ApplyTorque(-this.b2Body.GetAngularVelocity() * .4);


            //body.applyTorque(-av * .99999f);


            //            if (!this.islink()) {

            //                var gameState = this.getGameState();

            //                if( gameState.director && gameState.scene ) {
            //                    var actorStar = new VK.CAAT.StarActor().initialize(gameState.director, gameState.scene, { x: this.sprite.x, y: this.sprite.y, width: this.sprite.width, height: this.sprite.height });
            //                    // add the actor.
            //                    gameState.ActorContainer.addChild(actorStar);
            //                }
            //            }
        },
        isActive: function () {
            if (this.active == false && !this.impactEmitter) {
                return false;
            }
            if (this.active == false && this.impactEmitter && this.impactEmitter.active == false) {
                return false;
            }
            return true;
        },
        deactivate: function (sfx, track) {
            if (sfx !== false) {
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'hero_destroyed' });
            }
            this._super();
            if (this.impactEmitter) {
                this.impactEmitter.activate(200);
            }
            var gs = this.getGameState();
            if (track === true) {
                var life = gs.getLifeCounter();
                gs.setLifeCounter(life - 1);
            }
        },
        //drawTailHelper: function (ctx, p1, p2, color) {
        //    var s = ctx,
        //       drawScale = 30;
        //    s.globalAlpha = 0.7;
        //    s.strokeStyle = '#4152AF';
        //    s.lineWidth = "5";
        //    s.beginPath();
        //    s.moveTo(p1.x * drawScale, p1.y * drawScale);
        //    s.lineTo(p2.x * drawScale, p2.y * drawScale);
        //    s.closePath();
        //    s.stroke();
        //    s.globalAlpha = 1;
        //},
        //drawTail: function (ctx, joint) {
        //    var p1 = joint.GetAnchorA();
        //    var p2 = joint.GetAnchorB();
        //    this.drawTailHelper(ctx, p1, p2);
        //},
        draw: function (ctx, timeDelta, hitTest) {
            if (this.impactEmitter) {
                this.impactEmitter.draw(ctx);
            }
            if (!this.active) {
                return;
            }

            if (this.trailEmitter) {
                ctx.globalAlpha = 0.5;
                this.trailEmitter.draw(ctx);
                ctx.globalAlpha = 1;
            }
            // override this.sprite.draw() to do our own custom
            this._super(ctx, timeDelta, hitTest);

            // try {

            var context = ctx;
            var sprite = this.sprite;

            if (!sprite.image) { return; }

            context.save();

            //if (this.b2Joint) {
            //    this.drawTail(ctx, this.b2Joint);
            //}
            context.translate(sprite.x, sprite.y)
            //if (this.sprite.angle != 0) { ctx.rotate(this.sprite.angle) }
            context.globalAlpha = sprite.alpha;
            context.translate(-sprite.left_offset, -sprite.top_offset);
            context.drawImage(sprite.image, -(sprite.width / 2), -(sprite.height / 2));
            context.restore();
            //} catch (e) {
            //    debugger
            //}
        }
    });
    VK.InGame.PlayerBall.getTail = function () {
        if (!VK.InGame.PlayerBall.m_tail) {
            VK.InGame.PlayerBall.m_tail = new VK.InGame.MonkeyTail();
        }
        return VK.InGame.PlayerBall.m_tail;
    };

    VK.InGame.PlayerBall.getSmallIcon = function () {
        if (!VK.InGame.PlayerBall.m_smallIcon) {
            var URL = VK.Canvas.getImageDef("monkeys_right").URL;

            // size * 2 //becuase we have two monkeys on sprite
            //VK.InGame.PlayerBall.m_smallIcon = VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_right", 72 * 2, 72);


            VK.InGame.PlayerBall.m_smallIcon = VK.Canvas.cutImage3(VK.Canvas.cutImage(jaws.assets.get(URL), "monkeys_right", 72 * 2, 72), 0, 0, 72, 72);
        }
        return VK.InGame.PlayerBall.m_smallIcon;
    };

    // keep track of last peg player so we can create new player at
    VK.InGame.lastPeg = null;
    VK.GameHelper.setXtype(VK.CONSTANT.PLAYER, VK.InGame.PlayerBall, { toolIndex: 0, instancesTotal: 1 });
    /////////////////////////////////////////////////////////////////////////


    VK.InGame.MonkeyTail = VK.Entity.extend({
        zIndex: 9,
        setTail: function (joint) {
            this.joint = joint;
        },
        init: function (options) {
            this._super(options);
        },
        update: function (timeDelta) { },
        drawTailHelper: function (ctx, p1, p2, color) {
            var s = ctx,
               drawScale = 30;
            s.globalAlpha = 0.5;
            s.strokeStyle = '#4152AF';
            s.lineWidth = "5";
            s.beginPath();
            s.moveTo(p1.x * drawScale, p1.y * drawScale);
            s.lineTo(p2.x * drawScale, p2.y * drawScale);
            s.closePath();
            s.stroke();
            s.globalAlpha = 1;
        },
        draw: function (ctx, timeDelta) {
            var joint = this.joint;
            if (!joint) { return; }
            var p1 = joint.GetAnchorA();
            var p2 = joint.GetAnchorB();
            this.drawTailHelper(ctx, p1, p2);
        }
    });
    VK.GameHelper.setXtype('MonkeyTail', VK.InGame.MonkeyTail, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });



})();