/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

VK.PlayMonkeySling = VK.EntityPlayStateBase.extend({
    debug: false,
    loadGame: function () {
        this._super();
        //        var peg = new VK.InGame.Peg({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 200 });
        //        this.addEntity(peg);

        this.player = new VK.InGame.PlayerBall({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 300, frequencyHz: VK.Box2D.PLAYER.frequencyHz, dampingRatio: VK.Box2D.PLAYER.dampingRatio, trail: true });
        this.addEntity(this.player);
        this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 620, y: this.WORLD_HEIGHT - 220 }));
        this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 200, y: this.WORLD_HEIGHT - 620 }));
        this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 390, y: this.WORLD_HEIGHT - 320 }));
        this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 390, y: this.WORLD_HEIGHT - 820 }));
        this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 720 }));

        //this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 790, y: this.WORLD_HEIGHT - 120 }));
        //this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 590, y: this.WORLD_HEIGHT - 920 }));
        //this.addEntity(new VK.InGame.Peg({ b2World: this.b2World, x: 810, y: this.WORLD_HEIGHT - 820 }));

        this.addEntity(new VK.InGame.Cloud2({ x: this.WORLD_WIDTH - 200, y: 50, vx: .6, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud4({ x: 0, y: 200, vx: .9, world_width: this.WORLD_WIDTH }));


        this.addEntity(new VK.InGame.Cloud2({ x: 900, y: 0, vx: .8, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud3({ x: 400, y: 300, vx: .9, world_width: this.WORLD_WIDTH }));

        this.addEntity(new VK.InGame.Cloud2({ x: 0, y: this.WORLD_HEIGHT - 300, vx: .4, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud4({ x: 0, y: this.WORLD_HEIGHT - 220, vx: .5, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud3({ x: 250, y: this.WORLD_HEIGHT - 420, vx: .6, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud4({ x: 800, y: this.WORLD_HEIGHT - 400, vx: .1, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud3({ x: 400, y: this.WORLD_HEIGHT - 800, vx: .3, world_width: this.WORLD_WIDTH }));

        this.addEntity(new VK.InGame.FruitBonus({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 400 }));
        this.addEntity(new VK.InGame.FruitBonus({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 500 }));
        this.addEntity(new VK.InGame.FruitBonus({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 600 }));
        this.addEntity(new VK.InGame.FruitBonus({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 700 }));
        this.addEntity(new VK.InGame.FruitBonus({ b2World: this.b2World, x: 300, y: this.WORLD_HEIGHT - 800 }));

        this.addEntity(new VK.InGame.Crate2({ b2World: this.b2World, x: 700, y: this.WORLD_HEIGHT - 200, w: 45, h: 45 }));
        this.addEntity(new VK.InGame.Crate({ b2World: this.b2World, x: 120, y: this.WORLD_HEIGHT - 100, w: 35, h: 35 }));

        //this.addEntity(new VK.InGame.CrateTnT({ b2World: this.b2World, x: 50, y: this.WORLD_HEIGHT - 50, w: 35, h: 35, isEnemy: true }));


        
        this.addEntity(new VK.InGame.Banana({ b2World: this.b2World, x: 500, y: this.WORLD_HEIGHT - 480, w: 35, h: 35, isEnemy: true }));
        this.addEntity(new VK.InGame.CrateTnT({ b2World: this.b2World, x: 550, y: this.WORLD_HEIGHT - 430, w: 35, h: 35, value: 5000 }));
        this.addEntity(new VK.InGame.CrateTnT({ b2World: this.b2World, x: 500, y: this.WORLD_HEIGHT - 430, w: 35, h: 35, value: 5000 }));

        //this.addEntity(new VK.InGame.CrateTnT({ b2World: this.b2World, x: 500, y: this.WORLD_HEIGHT - 630, w: 35, h: 35 }));

        this.addEntity(new VK.InGame.WoodLongBlock({ b2World: this.b2World, x: 600, y: this.WORLD_HEIGHT - 350, w: 250, h: 21, breakable: true }));

        this.addEntity(new VK.InGame.BrickLongBlock({ b2World: this.b2World, x: 600, y: this.WORLD_HEIGHT - 300, w: 250, h: 21, breakable: true }));
        this.addEntity(new VK.InGame.GlassLongBlock({ b2World: this.b2World, x: 600, y: this.WORLD_HEIGHT - 300, w: 250, h: 21, breakable: true }));

        this.addEntity(new VK.InGame.GlassCubeBlock({ b2World: this.b2World, x: 200, y: this.WORLD_HEIGHT - 600, w: 42, h: 42, breakable: true }));

        this.addEntity(new VK.InGame.GlassMidBlock({ b2World: this.b2World, x: 200, y: this.WORLD_HEIGHT - 600, w: 87, h: 42, breakable: true }));

        this.addEntity(new VK.InGame.WoodLongBlockAngle({ b2World: this.b2World, x: 200, y: this.WORLD_HEIGHT - 400, w: 207, h: 21, angle: 90 * VK.Box2dUtils.DEGREE_TO_RADIAN }));

        this.addEntity(new VK.InGame.GlassTriangleBlock({ b2World: this.b2World, x: 400, y: this.WORLD_HEIGHT - 250, w: 84, h: 84 }));

        ////////////////////////// START FLOATING STRUCTURE /////////////////////////////////
        ////////////////////////// START FLOATING STRUCTURE /////////////////////////////////


        this.addEntity(new VK.InGame.Ballon({ b2World: this.b2World, x: 550, y: this.WORLD_HEIGHT - 530, w: 40, h: 55, color: 'purple', breakable: true }));
        this.addEntity(new VK.InGame.WoodLongBlock({ b2World: this.b2World, x: 550, y: this.WORLD_HEIGHT - 570, w: 250, h: 21, breakable: true }));
        this.addEntity(new VK.InGame.WoodCubeBlock({ b2World: this.b2World, x: 450, y: this.WORLD_HEIGHT - 520, w: 50, h: 83, breakable: true }));
        this.addEntity(new VK.InGame.BrickCubeBlock({ b2World: this.b2World, x: 650, y: this.WORLD_HEIGHT - 520, w: 50, h: 83, breakable: true }));
        this.addEntity(new VK.InGame.WoodCubeBlock({ b2World: this.b2World, x: 450, y: this.WORLD_HEIGHT - 440, w: 50, h: 83, breakable: true }));
        this.addEntity(new VK.InGame.WoodCubeBlock({ b2World: this.b2World, x: 650, y: this.WORLD_HEIGHT - 440, w: 50, h: 83, breakable: true }));

        // GROUND
        this.addEntity(new VK.InGame.BrickLongBlock({ b2World: this.b2World, x: 550, y: this.WORLD_HEIGHT - 370, w: 250, h: 21, type: b2Body.b2_staticBody }));

        ////////////////////////// END FLOATING STRUCTURE /////////////////////////////////
        ////////////////////////// END FLOATING STRUCTURE /////////////////////////////////


        this.addEntity(new VK.InGame.Ballon({ b2World: this.b2World, x: 110, y: this.WORLD_HEIGHT - 230, w: 40, h: 55, color: 'blue', breakable: true }));
        this.addEntity(new VK.InGame.Ballon({ b2World: this.b2World, x: 60, y: this.WORLD_HEIGHT - 220, w: 40, h: 55, color: 'red', breakable: true }));
        this.addEntity(new VK.InGame.Ballon({ b2World: this.b2World, x: 140, y: this.WORLD_HEIGHT - 450, w: 40, h: 55, color: 'yellow', breakable: true }));
        this.addEntity(new VK.InGame.Ballon({ b2World: this.b2World, x: 350, y: this.WORLD_HEIGHT - 390, w: 40, h: 55, color: 'green', breakable: true }));

        this.addEntity(new VK.InGame.BrickMidBlock({ b2World: this.b2World, x: 140, y: this.WORLD_HEIGHT - 50, w: 87, h: 42, breakable: true }));
        this.addEntity(new VK.InGame.WoodMidBlock({ b2World: this.b2World, x: 140, y: this.WORLD_HEIGHT - 150, w: 87, h: 42, breakable: true }));


        this.addEntity(new VK.InGame.BrickRoundBlock({ b2World: this.b2World, x: 220, y: this.WORLD_HEIGHT - 350, w: 30, h: 30, breakable: true }));
        this.addEntity(new VK.InGame.WoodRoundBlock({ b2World: this.b2World, x: 220, y: this.WORLD_HEIGHT - 350, w: 30, h: 30, breakable: true }));
        this.addEntity(new VK.InGame.GlassRoundBlock({ b2World: this.b2World, x: 220, y: this.WORLD_HEIGHT - 350, w: 30, h: 30, breakable: true }));

        this.addEntity(new VK.InGame.OscillatingBubble({ b2World: this.b2World, x: 350, y: this.WORLD_HEIGHT - 210, radius: 20, breakable: true }));
        this.addEntity(new VK.InGame.OscillatingBubble({ b2World: this.b2World, x: 360, y: this.WORLD_HEIGHT - 220, radius: 20, breakable: true }));
        this.addEntity(new VK.InGame.OscillatingBubble({ b2World: this.b2World, x: 370, y: this.WORLD_HEIGHT - 230, radius: 20, breakable: true }));
        this.addEntity(new VK.InGame.OscillatingBubble({ b2World: this.b2World, x: 390, y: this.WORLD_HEIGHT - 220, radius: 30, breakable: true }));
        this.addEntity(new VK.InGame.Ballon2({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 230, 'radius': 10, 'color': 'deepskyblue', 'breakable': true }));


        this.addEntity(new VK.InGame.SpinningGemYellow({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 230 }));
        this.addEntity(new VK.InGame.SpinningCoinGold({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 260 }));
        this.addEntity(new VK.InGame.SpinningCoinGold({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 290 }));
        this.addEntity(new VK.InGame.SpinningCoinSilver({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 320 }));
        this.addEntity(new VK.InGame.SpinningGemYellow({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 350 }));

        this.addEntity(new VK.InGame.Star({ b2World: this.b2World, x: 90, y: this.WORLD_HEIGHT - 400 }));

        this.addEntity(new VK.InGame.SpinningStarGold({ b2World: this.b2World, x: 250, y: this.WORLD_HEIGHT - 400 }));
        this.addEntity(new VK.InGame.SpinningStarGold({ b2World: this.b2World, x: 250, y: this.WORLD_HEIGHT - 500 }));
        //this.addEntity(new VK.InGame.Star({ b2World: this.b2World, x: 250, y: this.WORLD_HEIGHT - 600, isStar: true }));

        // this.addEntity(new VK.Block2.Wood_Square({ b2World: this.b2World, x: 200, y: this.WORLD_HEIGHT - 300, breakable: true, w: 120, h: 60 }));
        this.addEntity(new VK.InGame.SpinningStarGold({ b2World: this.b2World, x: 250, y: this.WORLD_HEIGHT - 550 }));


        /////////////////////////// CAAT TEST CODE ///////////////////////
        //////////////////////////////////////////////////////////////////

        var me = this;

        var FallingStarsActorContainer;
        function __scene(director) {

            var scene = director.createScene();

            var bg = new CAAT.ActorContainer().
            setBounds(0, 0, director.width, director.height)
            //setFillStyle('#222');

            scene.addChild(bg);

            // create a sprite image of 1 row by 6 columns
            var starsImage = new CAAT.SpriteImage().
            initialize(director.getImage('stars'), 1, 6);

            var T = 2500;

            //var mouseStars = function (mouseEvent) {
            //    var actorStar = new VK.CAAT.StarActor().initialize(director, scene, { x: mouseEvent.point.x, y: mouseEvent.point.y });
            //    // add the actor.
            //    bg.addChild(actorStar);
            //};

            // set background's mouse handlers.
            //                bg.mouseMove = mouseStars;
            //                bg.mouseDrag = mouseStars;
            me.ActorContainer = bg;
            me.director = director;
            me.directorScene = scene;
            //me.mouseStars = mouseStars;


            FallingStarsActorContainer = new VK.CAAT.ParticleStarContainerActor().initialize(me.director, me.directorScene, { x: 0, y: 0, w: me.WORLD_WIDTH, h: me.WORLD_HEIGHT });


            // add the actor.
            me.directorScene.addChild(FallingStarsActorContainer);

            me.centerAroundPlayer();

        };

        if (!this.CAAT_Init) {
            // ONLY DO THIS ONCE PER INSTANCE
            this.addListener(VK.DOM.Event.Type.onPointerDown, this.canvas, function (e) {
                var point = me._calcPointerXYPixel(e);
                var actorStar = new VK.CAAT.SmokeActor().initialize(me.director, me.directorScene, { x: point.x, y: point.y, width: 50, height: 50 });
                // add the actor.
                me.ActorContainer.addChild(actorStar);


                //            var point = me._calcPointerXYPixel(e);

                //            var actorStar = new VK.CAAT.ParticleStarContainerActor().initialize(me.director, me.directorScene, { x: 0, y: 0, w: me.WORLD_WIDTH, h: me.WORLD_HEIGHT });


                //            // add the actor.
                //            me.scene.addChild(actorStar);

                //            actorStar.selectionEvent({ x: point.x, y: point.y, width: 100, height: 100 });



                var point = me._calcPointerXYPixel(e);



                FallingStarsActorContainer.activateBehavior({ x: point.x, y: point.y, width: 100, height: 100 });


            });

            //director.enableResizeEvents(CAAT.Director.prototype.RESIZE_PROPORTIONAL);

            new CAAT.ImagePreloader().loadImages(
            VK.CAAT.Resources,
            function (counter, images) {
                if (counter == images.length) {
                    me.director.setImagesCache(images);
                    __scene(me.director);
                }
            });

            this.CAAT_Init = true;

        }
        /////////////////////////// END CAAT TEST CODE ///////////////////////
        //////////////////////////////////////////////////////////////////









        /////////////////////////// ROPE TEST CODE ///////////////////////
        //////////////////////////////////////////////////////////////////
        /*
        var xpos = 50;
        var ypos = this.WORLD_HEIGHT - 400;

        
        var polygonShape = new b2PolygonShape();
        polygonShape.SetAsBox(2 / VK.Box2D.WORLD_SCALE, 2 / VK.Box2D.WORLD_SCALE);
        
        var fixtureDef = VK.Box2dUtils.generateB2FixtureDef(1, 1, 0.5);
        fixtureDef.shape = polygonShape;
        var bodyDef = VK.Box2dUtils.generateB2BodyDef(null, xpos, ypos, { Name: VK.CONSTANT.ROPE, Entity: this });

        var wall = this.b2World.CreateBody(bodyDef);
        wall.CreateFixture(fixtureDef);


        var circleShape = new b2CircleShape(6 / VK.Box2D.WORLD_SCALE);
        fixtureDef = VK.Box2dUtils.generateB2FixtureDef(1, 1, 0.5);
        fixtureDef.shape = circleShape;
        var bodyDef = VK.Box2dUtils.generateB2BodyDef(null, xpos + 120, ypos, { Name: VK.CONSTANT.ROPE, Entity: this });
        steelBall = this.b2World.CreateBody(bodyDef);
        steelBall.CreateFixture(fixtureDef);

        VK.Box2dUtils.generateRope(wall, steelBall, 8, 1, 60, { Name: VK.CONSTANT.ROPE, Entity: this });
        */
        /////////////////////////// END ROPE TEST CODE ///////////////////////
        //////////////////////////////////////////////////////////////////

        //////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////
        //  making a car
        //  two wheels         
        /*
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        var fixDef = new b2FixtureDef;
        fixDef.density = 30;
        fixDef.friction = 10;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2CircleShape(0.3)

        var wheel1 = this.b2World.CreateBody(bodyDef)
        wheel1.CreateFixture(fixDef);

        var wheel2 = this.b2World.CreateBody(bodyDef)
        wheel2.CreateFixture(fixDef);
        //  car body
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(27, 8)
        var fixDef = new b2FixtureDef;
        fixDef.density = 30;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2PolygonShape
        fixDef.shape.SetAsArray([
        new b2Vec2(1, -1.2),

        new b2Vec2(1.5, -0.5),
        new b2Vec2(1.3, 0),
        new b2Vec2(-1.3, 0),
        new b2Vec2(-1.5, -0.5),

        new b2Vec2(-0.3, -1.2)
        ]);


        var car = this.b2World.CreateBody(bodyDef)
        car.CreateFixture(fixDef);

        var myjoint = new b2RevoluteJointDef();

        myjoint.bodyA = car;
        myjoint.bodyB = wheel1;
        myjoint.localAnchorA.Set(-0.7, 0);
        myjoint.enableMotor = true;

        myjoint.maxMotorTorque = 55;
        myjoint.motorSpeed = -10;
        this.b2World.CreateJoint(myjoint);

        myjoint.bodyA = car;
        myjoint.bodyB = wheel2;
        myjoint.localAnchorA.Set(0.8, 0);
        this.b2World.CreateJoint(myjoint);
        */
        //////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////
    },
    drawBefore: function (ctx) {
        //this.parallax.draw(ctx, this);
    },
    updateBefore: function () {
    },
    setup: function () {
        this._super();

        //this.parallax = new jaws.Parallax({ repeat_x: true })
        //this.parallax.addLayer({ image: "assets/ingame/bg/theme1/background.png", damping: 100 })
        //this.parallax.addLayer({ image: "assets/ingame/bg/theme1/parallax_1.png", damping: 6 })
        //this.parallax.addLayer({ image: "assets/ingame/bg/theme1/parallax_2.png", damping: 4 })
        this.loadGame();
    },
    init: function (options) {
        this.setWorldWidth(2900); // 2800 //2048
        this.setWorldHeight(1600);
        this._super(options);
    }
});