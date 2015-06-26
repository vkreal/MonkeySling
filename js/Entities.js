/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    // Player
    var WORLD_SCALE = VK.Box2D.WORLD_SCALE;
    /*
    VK.InGame.Button = VK.Entity.extend({
    init: function (options) {
    this._super(options);


    this.spriteSheet = jaws.assets.get("assets/ingame/yellow_buttons.png");

    this.playImg = VK.Canvas.cutImage(this.spriteSheet, "ingame-btn-play");
    this.stopImg = VK.Canvas.cutImage(this.spriteSheet, "ingame-btn-stop");

    this.sprite = new jaws.Sprite({ image: this.playImg, x: this.x, y: this.y });
    },
    update: function (timeDelta) {
    },
    draw: function (ctx, timeDelta) {
    this.sprite.draw();
    }
    });
    */
    VK.InGame.Cloud1 = VK.Entity.extend({
        name: VK.CONSTANT.Cloud1,
        imgUrl: "assets/Cloud1.png",
        alpha: 0.6,
        canRotate: function () {
            return false;
        },
        moveSensorRadius: 120 / 2,
        createDesignerSensorBodyDef: function (userData) {
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.sprite.x), (this.sprite.y), userData);
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2(this.sprite.x / VK.Box2D.WORLD_SCALE, this.sprite.y / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },
        init: function (options) {
            if (!options.vx) {
                options.vx = 0.5; // set defaults
            }
            
            this._super(options);
            this.imgSprite = jaws.assets.get(this.imgUrl);
            this.sprite = new jaws.Sprite({ image: this.imgSprite, x: this.x, y: this.y });
            var dim = VK.GameHelper.getWorldDimension();
            this.world_width = dim.w;

            this.createDesignerSensorMove();
        },
        update: function (timeDelta) {
            if (this.isDesignMode) { return; }
            this.sprite.x += this.vx;
            this.sprite.alpha = this.alpha;
            if (this.sprite.x > this.world_width) {
                this.sprite.x = -this.sprite.width;
            }
        },
        draw: function (ctx, timeDelta) {
            // this.sprite.draw();
            var sprite = this.sprite;
            ctx.save();
            ctx.translate(sprite.x, sprite.y);
            ctx.globalAlpha = sprite.alpha;
            ctx.translate(-sprite.left_offset, -this.top_offset); // Needs to be separate from above translate call cause of flipped
            //ctx.drawImage(sprite.image, 0, 0, sprite.width, sprite.height);
            ctx.drawImage(sprite.image, -(sprite.width - sprite.width / 2), -(sprite.height - sprite.height / 2), sprite.width, sprite.height);
            ctx.restore();


        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.Cloud1, VK.InGame.Cloud1, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });

    /////////////////////////////////////////////////////////////////////////
    VK.InGame.Cloud2 = VK.InGame.Cloud1.extend({
        name: VK.CONSTANT.Cloud2,
        imgUrl: "assets/Cloud2.png",
        alpha: 0.3
    });
    VK.GameHelper.setXtype(VK.CONSTANT.Cloud2, VK.InGame.Cloud2, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });
    /////////////////////////////////////////////////////////////////////////
    VK.InGame.Cloud3 = VK.InGame.Cloud1.extend({
        name: VK.CONSTANT.Cloud3,
        imgUrl: "assets/cloud3.png",
        alpha: 0.6
    });
    VK.GameHelper.setXtype(VK.CONSTANT.Cloud3, VK.InGame.Cloud3);
    /////////////////////////////////////////////////////////////////////////

    VK.InGame.Cloud4 = VK.InGame.Cloud1.extend({
        name: VK.CONSTANT.Cloud4,
        imgUrl: "assets/cloud4.png",
        alpha: 0.8
    });
    VK.GameHelper.setXtype(VK.CONSTANT.Cloud4, VK.InGame.Cloud4);
    /////////////////////////////////////////////////////////////////////////



    VK.InGame.SpinningStarGold = VK.Entity.extend({
        name: 'spinning_star',
        value: 10000,
        // SpinningStar is always consider a star
        isStar: true,
        moveSensorRadius: 35 / 2,
        w: 35,
        getToolbarIcon: function () {
            return this.anim.next();
        },
        canRotate: function () {
            return false;
        },
        beginContact: function (contact) {
            var b = contact.GetFixtureA().GetBody(), userData = null;
            if (b) {
                userData = b.GetUserData();
                if (userData && userData.Name == VK.CONSTANT.PLAYER) {
                    this.deactivate();
                    this.getGameState().playSound('beep');
                }
            }
        },
        deactivate: function () {
            this._super();
            if (this.impactEmitter) {
                this.impactEmitter.activate(200);
            }
            this.m_bonus_num = new VK.InGame.BonusPoints({ x: this.x, y: this.y, point: this.value });
            this.getGameState().addEntity(this.m_bonus_num);
        },
        initAnim: function () {
            this.anim = new jaws.Animation({ sprite_sheet: this.spriteImg, frame_size: [this.w, this.w], frame_duration: 100, cacheKey: this.name });
        },
        createBody: function (radius, userData) {

            userData = userData || { Name: this.name, Entity: this };

            var shape = new b2CircleShape((radius ? radius : (this.w / 2) / WORLD_SCALE));
            var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
            fixture.isSensor = true;
            fixture.shape = shape;
            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x + (this.w / 2)), (this.y + (this.w / 2)), userData);
            var body = this.b2World.CreateBody(bodyDef);
            body.CreateFixture(fixture);

            return body;
        },
        init: function (options) {
            this._super(options);

            this.spriteDef = VK.Canvas.getImageDef(this.name);
            this.spriteImg = VK.Canvas.cutImage(jaws.assets.get(this.spriteDef.URL), this.name);

            this.initAnim();
            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
            if (!this.h_sprite) {
                this.h_sprite = new jaws.Sprite({ alpha: .7, image: "assets/ingame/star_highlight.png", x: this.x - 30, y: this.y - 30 });
            }
            if (!this.isDesignMode) {
                this.b2Body = this.createBody();
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

            }
            else if (this.isDesignMode && this.b2World) {
                this.createDesignerSensorMove();
            }
        },
        update: function (timeDelta) {
            this.sprite.setImage(this.anim.next());
            if (this.impactEmitter) {
                this.impactEmitter.x = this.x + (this.w / 2);
                this.impactEmitter.y = this.y + (this.w / 2);
                this.impactEmitter.update(timeDelta);
            }
        },
        draw: function (ctx, timeDelta) {
            this._super(ctx, timeDelta);
            if (!this.isDesignMode) {
                this.h_sprite.draw(ctx);
            }
            if (this.impactEmitter) {
                this.impactEmitter.draw(ctx);
            }
            if (!this.active) {
                return;
            }
            this.sprite.draw(ctx);
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
        drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
            context.arc(sprite.x + (radius / 2.5), sprite.y + (radius / 2.5), radius, Math.PI * 0, Math.PI * 2);
        }
    });
    VK.GameHelper.setXtype('spinning_star', VK.InGame.SpinningStarGold, { toolIndex: 3, instancesTotal: 50, scope: (VK.isDebugMode() ? VK.CONSTANT.ENTITY_SCOPE.PUBLIC : VK.CONSTANT.ENTITY_SCOPE.PROTECTED) });

    VK.InGame.SpinningStarGold2 = VK.InGame.SpinningStarGold.extend({
        name: 'spinning_star2',
        moveSensorRadius: 36 / 2,
        w: 36,
        init: function (options) {
            this._super(options);
            this.h_sprite = new jaws.Sprite({ alpha: .7, image: "assets/ingame/star_highlight.png", x: this.x - 30, y: this.y - 25 });
        }
    });
    VK.GameHelper.setXtype('spinning_star2', VK.InGame.SpinningStarGold2, { toolIndex: 3, instancesTotal: 50 });


    VK.InGame.SpinningCoinGold = VK.Entity.extend({
        name: VK.CONSTANT.SPINNING_COIN_GOLD,
        value: 100,
        frame_size: [16, 16],
        moveSensorRadius: 10,
        createDesignerSensorBodyDef: function (userData) {
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.sprite.x + this.moveSensorRadius), (this.sprite.y + this.moveSensorRadius), userData);
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2((this.x + this.moveSensorRadius) / VK.Box2D.WORLD_SCALE, (this.y + this.moveSensorRadius) / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },
        getToolbarIcon: function () {
            return this.anim.next();
        },
        canRotate: function () {
            return false;
        },
        deactivate: function () {
            this._super();
            if (this.impactEmitter) {
                this.impactEmitter.activate(200);
            }
            this.m_bonus_num = new VK.InGame.BonusPoints({ x: this.x, y: this.y, point: this.value });
            this.getGameState().addEntity(this.m_bonus_num);
        },
        beginContact: function (contact) {
            var b = contact.GetFixtureA().GetBody(), userData = null;
            if (b) {
                userData = b.GetUserData();
                if (userData && userData.Name == VK.CONSTANT.PLAYER) {
                    this.deactivate();
                    this.getGameState().playSound('beep');
                }
            }
        },
        initAnim: function () {
            this.anim = new jaws.Animation({ sprite_sheet: this.spriteImg, frame_size: this.frame_size, frame_duration: 100, orientation: 'right', cacheKey: this.name })
        },
        init: function (options) {
            this._super(options);

            this.spriteDef = VK.Canvas.getImageDef(this.name);

            this.spriteImg = VK.Canvas.cutImage(jaws.assets.get(this.spriteDef.URL), this.name);
            this.initAnim();
            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
            this.createDesignerSensorMove();
            if (!this.isDesignMode) {
                var radius = this.frame_size[0] / 2;
                var shape = new b2CircleShape((radius) / WORLD_SCALE);
                var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
                fixture.isSensor = true;
                fixture.shape = shape;
                var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x + (radius)), (this.y + (radius)), { Name: this.name, Entity: this });
                this.b2Body = this.b2World.CreateBody(bodyDef);
                this.b2Body.CreateFixture(fixture);

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

            }

            // need to set the first anim so level designer can pick it up
            this.sprite.setImage(this.anim.next());
        },
        update: function (timeDelta) {
            this.sprite.setImage(this.anim.next());
            if (this.impactEmitter) {
                this.impactEmitter.x = this.x + (35 / 2);
                this.impactEmitter.y = this.y + (35 / 2);
                this.impactEmitter.update(timeDelta);
            }
        },
        draw: function (ctx, timeDelta) {
            this._super(ctx, timeDelta);

            if (this.impactEmitter) {
                this.impactEmitter.draw(ctx);
            }
            if (!this.active) {
                return;
            }

            this.sprite.draw(ctx, timeDelta);
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
        drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
            context.arc(sprite.x + (radius / 4), sprite.y + (radius / 4), radius, Math.PI * 0, Math.PI * 2);
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.SPINNING_COIN_GOLD, VK.InGame.SpinningCoinGold);

    VK.InGame.SpinningCoinSilver = VK.InGame.SpinningCoinGold.extend({
        name: 'spinning_coin_silver'
    });
    VK.GameHelper.setXtype('spinning_coin_silver', VK.InGame.SpinningCoinSilver);

    VK.InGame.SpinningGemYellow = VK.InGame.SpinningCoinGold.extend({
        name: 'gem_yellow'
    });
    VK.GameHelper.setXtype('gem_yellow', VK.InGame.SpinningGemYellow);

    VK.InGame.SpinningGemBlue = VK.InGame.SpinningCoinGold.extend({
        name: 'gem_blue'
    });
    VK.GameHelper.setXtype('gem_blue', VK.InGame.SpinningGemBlue);

    VK.InGame.SpinningGemGreen = VK.InGame.SpinningCoinGold.extend({
        name: 'gem_green'
    });
    VK.GameHelper.setXtype('gem_green', VK.InGame.SpinningGemGreen);

    VK.InGame.SpinningGemPurple = VK.InGame.SpinningCoinGold.extend({
        name: 'gem_purple'
    });
    VK.GameHelper.setXtype('gem_purple', VK.InGame.SpinningGemPurple);

    VK.InGame.SpinningGemRed = VK.InGame.SpinningCoinGold.extend({
        name: 'gem_red'
    });
    VK.GameHelper.setXtype('gem_red', VK.InGame.SpinningGemRed);

    VK.InGame.SpinningGemSilver = VK.InGame.SpinningCoinGold.extend({
        name: 'gem_silver'
    });
    VK.GameHelper.setXtype('gem_silver', VK.InGame.SpinningGemSilver);
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    VK.InGame.SpinningCrystalBlue = VK.InGame.SpinningCoinGold.extend({
        name: 'crystal-spinning-blue',
        frame_size: [32, 32],
        moveSensorRadius: 16,
        //        init: function (options) {
        //            //['blue', 'green', 'grey', 'orange', 'pink', 'yellow'];
        //            this._super(options);
        //        },
        drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
            context.arc(sprite.x + (radius / 2), sprite.y + (radius / 2), radius, Math.PI * 0, Math.PI * 2);
        }
    });
    VK.GameHelper.setXtype('crystal-spinning-blue', VK.InGame.SpinningCrystalBlue);

    VK.InGame.SpinningCrystalGreen = VK.InGame.SpinningCrystalBlue.extend({
        name: 'crystal-spinning-green'
    });
    VK.GameHelper.setXtype('crystal-spinning-green', VK.InGame.SpinningCrystalGreen);

    VK.InGame.SpinningCrystalGrey = VK.InGame.SpinningCrystalBlue.extend({
        name: 'crystal-spinning-grey'
    });
    VK.GameHelper.setXtype('crystal-spinning-grey', VK.InGame.SpinningCrystalGrey);

    VK.InGame.SpinningCrystalOrange = VK.InGame.SpinningCrystalBlue.extend({
        name: 'crystal-spinning-orange'
    });
    VK.GameHelper.setXtype('crystal-spinning-orange', VK.InGame.SpinningCrystalOrange);

    VK.InGame.SpinningCrystalPink = VK.InGame.SpinningCrystalBlue.extend({
        name: 'crystal-spinning-pink'
    });
    VK.GameHelper.setXtype('crystal-spinning-pink', VK.InGame.SpinningCrystalPink);

    VK.InGame.SpinningCrystalYellow = VK.InGame.SpinningCrystalBlue.extend({
        name: 'crystal-spinning-yellow'
    });
    VK.GameHelper.setXtype('crystal-spinning-yellow', VK.InGame.SpinningCrystalYellow);
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    VK.InGame.Star = VK.Entity.extend({
        name: 'small_star32x32',
        value: 1000,
        radius: 32,
        moveSensorRadius: 16,
        createDesignerSensorBodyDef: function (userData) {
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.sprite.x + this.moveSensorRadius), (this.sprite.y + this.moveSensorRadius), userData);
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2((this.x + this.moveSensorRadius) / VK.Box2D.WORLD_SCALE, (this.y + this.moveSensorRadius) / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },
        //        imgUrl2: 'assets/ingame/spinning_oscillating_ring.png',
        canRotate: function () {
            return false;
        },
        deactivate: function () {
            this._super();
            this.m_bonus_num = new VK.InGame.BonusPoints({ x: this.x, y: this.y, point: this.value });
            this.getGameState().addEntity(this.m_bonus_num);
        },
        beginContact: function (contact) {
            var b = contact.GetFixtureA().GetBody(), userData = null;
            if (b) {
                userData = b.GetUserData();
                if (userData && userData.Name == VK.CONSTANT.PLAYER) {
                    this.deactivate();
                    this.getGameState().playSound('beep');
                }
            }
        },
        initAnim: function () {
            //            this.anim = new jaws.Animation({ sprite_sheet: this.imgUrl2, frame_size: [32, 32], frame_duration: 100, orientation: 'right' })
        },
        getToolbarIcon: function () {
            return this.spriteImg;
        },
        init: function (options) {
            this._super(options);


            this.spriteDef = VK.Canvas.getImageDef(this.name);
            this.spriteImg = VK.Canvas.cutImage(jaws.assets.get(this.spriteDef.URL), this.name);

            this.initAnim();
            this.sprite = new jaws.Sprite({ image: this.spriteImg, x: this.x, y: this.y });
            //            this.sprite2 = new jaws.Sprite({ x: this.x, y: this.y});
            this.createDesignerSensorMove();
            if (!this.isDesignMode) {
                var shape = new b2CircleShape((this.radius / 2) / WORLD_SCALE);
                var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
                fixture.isSensor = true;
                fixture.shape = shape;
                var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x + (this.radius / 2)), (this.y + (this.radius / 2)), { Name: this.name, Entity: this });
                this.b2Body = this.b2World.CreateBody(bodyDef);
                this.b2Body.CreateFixture(fixture);
            }
        },
        update: function (timeDelta) {
            //            this.sprite2.setImage(this.anim.next())
        },
        draw: function (ctx, timeDelta, hitTest) {
            this._super(ctx, timeDelta, hitTest);
            this.sprite.draw(ctx);
            //            this.sprite2.draw();
        },
        drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
            context.arc(sprite.x + (radius / 2.5), sprite.y + (radius / 2.5), radius, Math.PI * 0, Math.PI * 2);
        }
    });
    VK.GameHelper.setXtype('small_star32x32', VK.InGame.Star, { scope: VK.CONSTANT.ENTITY_SCOPE.PROTECTED });
    /////////////////////////////////////////////////////////////////////////

    VK.InGame.FruitBonus = VK.Entity.extend({
        name: VK.CONSTANT.FRUITBONUS,
        id: 'bonus-' + (new Date()).getTime(),
        active: true,
        impactEmitter: null,
        moveSensorRadius: 16,
        createDesignerSensorBodyDef: function (userData) {
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.sprite.x + this.moveSensorRadius), (this.sprite.y + this.moveSensorRadius), userData);
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2((this.x + this.moveSensorRadius) / VK.Box2D.WORLD_SCALE, (this.y + this.moveSensorRadius) / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },
        canRotate: function () {
            return false;
        },
        set2: function (options) {
            this._super(options);
            var EX = VK.CONSTANT.ENTITY_EXTERN;
            if (options[EX.IMAGE]) {
                this.setImage(options[EX.IMAGE]);
            }
        },
        get: function (options) {
            options = options || {};
            this._super(options);
            var EX = VK.CONSTANT.ENTITY_EXTERN;
            if (this.getImage()) {
                options[EX.IMAGE] = this.getImage();
            }
            return options;
        },
        setImage: function (v) {
            this.icon = v;
        },
        getImage: function () {
            return this.icon;
        },
        beginContact: function (contact) {
            var b = contact.GetFixtureA().GetBody(), userData = null;
            if (b) {
                userData = b.GetUserData();
                if (userData && userData.Name == VK.CONSTANT.PLAYER) {
                    this.deactivate();
                    this.getGameState().playSound('beep');
                }
            }
        },
        init: function (options) {
            this._super(options);

            if (!VK.InGame.FruitBonus.__spritesCoords) {
                VK.InGame.FruitBonus.__spritesCoords = {
                    basic: [
                        { x: 0, y: 0 }, //32x32 
                        {x: 0, y: 42 }, //32x32 
                        {x: 0, y: 84 }, //32x32 
                        {x: 0, y: 126 }, //32x32 
                        {x: 0, y: 168 }, //32x32 
                        {x: 0, y: 210 }, //32x32 
                        {x: 0, y: 252 } //32x32 
                    ]
                }
            }
            if (!VK.InGame.FruitBonus.sprite) {
                VK.InGame.FruitBonus.sprite = new jaws.Sprite({ image: jaws.assets.get("assets/ingame/fruits_bonus.png") });
            }
            if (!this.isDesignMode) {
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
            }
            if (!this.icon) {
                this.icon = VK.InGame.FruitBonus.__spritesCoords.basic[Math.min(Math.round(Math.random() * 8), 6)];
            }
            this.setWidth(32);
            this.setHeight(32);

            var width = this.getWidth();
            var height = this.getHeight();

            this.radius = width / 2;
            this.value = 100;

            // cut sprite
            // TODO: USE CACHING !!!!
            var cut = document.createElement("canvas");
            cut.width = width;
            cut.height = height;
            var ctx = cut.getContext("2d");
            // done cutting

            ctx.drawImage(VK.InGame.FruitBonus.sprite.image, this.icon.x, this.icon.y, width, height, 0, 0, width, height);
            this.sprite = new jaws.Sprite({ image: cut, x: this.x, y: this.y });
            this.createDesignerSensorMove();
            if (!this.isDesignMode) {
                var shape = new b2CircleShape((width / 2) / WORLD_SCALE);
                var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
                fixture.isSensor = true;
                fixture.shape = shape;
                var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x + (width / 2)), (this.y + (height / 2)), { Name: this.name, Entity: this });
                this.b2Body = this.b2World.CreateBody(bodyDef);
                this.b2Body.CreateFixture(fixture);
            }
            return this;
        },
        update: function (timeDelta) {
            if (this.impactEmitter) {
                this.impactEmitter.x = this.x + (this.getWidth() / 2);
                this.impactEmitter.y = this.y + (this.getHeight() / 2);
                this.impactEmitter.update(timeDelta);
            }
        },
        draw: function (ctx, timeDelta, hitTest) {
            if (this.impactEmitter) {
                this.impactEmitter.draw(ctx);
            }
            if (!this.active) {
                return;
            }
            this._super(ctx, timeDelta, hitTest);
            this.sprite.draw(ctx);
        },
        drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
            context.arc(sprite.x + (radius / 2), sprite.y + (radius / 2), radius, Math.PI * 0, Math.PI * 2);
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
        deactivate: function () {
            this._super();
            this.m_bonus_num = new VK.InGame.BonusPoints({ x: this.x, y: this.y, point: this.value });
            this.getGameState().addEntity(this.m_bonus_num);
            if (this.impactEmitter) {
                this.impactEmitter.activate(200);
            }

        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.FRUITBONUS, VK.InGame.FruitBonus);
    /////////////////////////////////////////////////////////////////////////
    
    VK.InGame.Peg = VK.Entity.extend({
        zIndex: 10,
        name: VK.CONSTANT.PEG,
        radius: 27,
        moveSensorRadius: 15,
        canRotate: function () { return false; },
        createDesignerSensorBodyDef: function (userData) {
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.sprite.x), (this.sprite.y), userData);
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2((this.x) / VK.Box2D.WORLD_SCALE, (this.y) / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },
        //getPixelPosition: function () {
        //    return { x: this.b2Body.GetPosition().x * WORLD_SCALE, y: this.b2Body.GetPosition().y * WORLD_SCALE };
        //},
        //getB2Position: function () {
        //    return { x: this.b2Body.GetPosition().x, y: this.b2Body.GetPosition().y };
        //},
        init: function (options) {
            // save pixel location
            this._super(options);
            this.sprite = new jaws.Sprite({ image: jaws.assets.get("assets/ingame/peg.png"), x: this.x, y: this.y });

            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }

            var shape = new b2CircleShape(this.radius / WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
            fixture.isSensor = true;
            fixture.shape = shape;
            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, this.x, this.y, { Name: this.name, Entity: this });
            this.b2Body = this.b2World.CreateBody(bodyDef);
            this.b2Body.CreateFixture(fixture);
        }
        ,
        draw: function (ctx, timeDelta, hitTest) {
            this._super(ctx, timeDelta, hitTest);

            //if (!this.isDesignMode) { return; }

//            ctx.save();
//            ctx.beginPath();
//            //ctx.fillStyle = "red";
//            //ctx.strokeStyle = 'red';
//            ctx.arc(this.x, this.y, this.radius, Math.PI * 0, Math.PI * 2);
//            ctx.fill();
//            //ctx.stroke();
//            ctx.restore();
            //debugger
            var context = ctx;
            var sprite = this.sprite;
            context.save()
            context.translate(sprite.x, sprite.y)
            //if (this.sprite.angle != 0) { ctx.rotate(this.sprite.angle) }
            //context.globalAlpha = sprite.alpha;
            context.translate(-sprite.left_offset, -sprite.top_offset);
            context.drawImage(sprite.image, -(sprite.width / 2) + 6, -(sprite.height / 2) - 6);
            context.restore();
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.PEG, VK.InGame.Peg, { toolIndex: 2, instancesTotal: 50 });
    /////////////////////////////////////////////////////////////////////////

    VK.InGame.PlayerPointer = VK.Entity.extend({
        name: VK.CONSTANT.PlayerPointer,
        imgUrl: "assets/player-pointer48.png",
        alpha: 0.6,
        ticks: 0,
        init: function (options) {
            this._super(options);
            this.origX = this.x;
            this.sprite = new jaws.Sprite({ image: jaws.assets.get(this.imgUrl), x: this.x, y: this.y });
        },
        update: function (timeDelta) {
            if (this.ticks < 30) {
                this.sprite.x = this.origX;
            }
            else {
                this.sprite.x = this.origX - 30;
            }
            if (this.ticks > 60) {
                this.ticks = 0;
            }

            this.ticks++;
        },
        draw: function (ctx, timeDelta) {
            this.sprite.draw();
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.PlayerPointer, VK.InGame.PlayerPointer, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });
    /////////////////////////////////////////////////////////////////////////


    VK.InGame.BonusPoints = VK.Entity.extend({
        zIndex: 0,
        name: 'BonusPoints',
        points: { 100: '100_bonus', 1000: '1000_bonus', 10000: '10000_bonus' },
        m__life_time: 1000, // 3 sec life span
        doAnim: function() {
            this.new_width = this.new_width - (this.new_width * .2);
            this.new_height = this.new_height - (this.new_height * .2);
            this.sprite.y += -30;
        },
        init: function (options) {
            this._super(options);
            var key = this.points[this.point];

            this.sprite = new jaws.Sprite({ image: VK.InGame.BonusPoints.getSprite(key), x: this.x, y: this.y });
            
            this.new_width = this.sprite.width;
            this.new_height = this.sprite.height;

            this.lifeTimer = this.getGameState().createTimer(this.m__life_time,
                function callback_timeout() {
                    if (this.lifeTimer) {
                        this.lifeTimer.cancel();
                    }
                }.bind(this),
                function callback_tick(time, ttime) {
                    if (ttime > 300 && !this.hit1)
                    {
                        // reduce height and width // shrinking effect
                        this.doAnim();
                        this.hit1 = true;
                    }
                    if (ttime > 600 && !this.hit2) {
                        // reduce height and width // shrinking effect
                        this.doAnim();
                        this.hit2 = true;
                    }
                    //if (ttime > 900 && !this.hit3) {
                    //    // reduce height and width // shrinking effect
                    //    this.doAnim();
                    //    this.hit3 = true;
                    //}
                }.bind(this),
                function callback_cancel() {
                    this.deactivate();
                }.bind(this)
            );
        },
        update: function (timeDelta) {
            
        },
        draw: function (ctx, timeDelta) {
            var sprite = this.sprite;
            ctx.save()
            ctx.translate(sprite.x, sprite.y);
            ctx.translate(-sprite.left_offset, -sprite.top_offset);
            ctx.drawImage(sprite.image, 0, 0, sprite.width, sprite.height, 0, 0, this.new_width, this.new_height);
            ctx.restore();
        }
    });
    VK.InGame.BonusPoints.sprite = {};
    VK.InGame.BonusPoints.getSprite = function (key) {
        if (!VK.InGame.BonusPoints.sprite[key]) {
            var spriteDef = VK.Canvas.getImageDef(key);
            VK.InGame.BonusPoints.sprite[key] = VK.Canvas.cutImage(jaws.assets.get(spriteDef.URL), key);
        }
        return VK.InGame.BonusPoints.sprite[key];
    };

    VK.GameHelper.setXtype('BonusPoints', VK.InGame.BonusPoints, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });
    
    VK.InGame.Wall.BOTTOM = VK.Entity.extend({
        b2World: null,
        name: VK.CONSTANT.WALL.BOTTOM,
        init: function (options) {
            this._super(options);
            //this.image = jaws.assets.get("assets/INGAME_STATIC_BLOCKS_GROUND.png");

            //this.canvas = VK.Canvas.renderToCanvas(490, 96, function (ctx, option) {
            //    ctx.drawImage(option.me.image, 0, 2, 490, 96, 0, 0, 490, 96);
            //}, null, { me: this });
            // ground is 120px thick
            this.WALL_PADDING = VK.GameHelper.getBottomWallHeight() / 2 - 2;
            if (this.isDesignMode) { return; }
            this.b2Body = VK.Box2dUtils.generateWall(this.b2World, this.WORLD_WIDTH, this.WALL_PADDING, 0, this.WORLD_HEIGHT - this.WALL_PADDING, { Name: this.name, Entity: this });
        },
        update: function (timeDelta) {
        },
        draw: function (ctx, timeDelta) {
            //ctx.save();
            //if (!this.ptrn) {
            //    this.ptrn = ctx.createPattern(this.canvas, 'repeat');
            //}
            //ctx.fillStyle = this.ptrn;
            //ctx.fillRect(0, this.WORLD_HEIGHT - (this.WALL_PADDING * 2), this.WORLD_WIDTH, this.WALL_PADDING * 2);
            //ctx.restore();
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.WALL.BOTTOM, VK.InGame.Wall.BOTTOM, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });
    /////////////////////////////////////////////////////////////////////////

    VK.InGame.BACKGROUND = VK.Entity.extend({
        // ovveride with init options
        theme: "assets/ingame/gamebg/theme1/theme1.png",
        init: function (options) {
            this.theme = options.theme || this.theme;
            this.sprite = new jaws.Sprite({ image: this.theme });

            this.tileLoop = Math.ceil(options.WORLD_WIDTH / this.sprite.width);
            if (this.tileLoop <= 0) {
                this.tileLoop = 1;
            }
        },
        draw: function (ctx) {
            try {
                var sprite = this.sprite;
                ctx.save();
                //ctx.translate(sprite.x, sprite.y);
                for (var i = 0; i < this.tileLoop; i++) {
                    ctx.drawImage(sprite.image, 0, 0, sprite.width, sprite.height, (i * sprite.width), (this.world_height - sprite.height), sprite.width, sprite.height);
                }
                ctx.restore();
            }
            catch (e)
            {
                var k = 1;
            }
            return this;

            //ctx.save();
            //if (!this.ptrn) {
            //    this.ptrn = ctx.createPattern(this.sprite.image, 'repeat');
            //}
            //ctx.fillStyle = this.ptrn;
            //ctx.fillRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
            //ctx.restore();

            //return this;
        }
    });

})();