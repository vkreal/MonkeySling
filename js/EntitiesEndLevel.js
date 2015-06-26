/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    
    VK.InGame.Banana = VK.Entity.extend({
        name: 'BANANA',
        id: 'banana-' + (new Date()).getTime(),
        active: true,
        impactEmitter: null,
        moveSensorRadius: 32,
        w: 64,
        h: 64,
        value: 10000,
        isEnemy: true,
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
            var image = jaws.assets.get("assets/ingame/banana.png");

            this._super(options);


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

                this.h_sprite = new jaws.Sprite({ alpha: .7, image: "assets/ingame/highlight.png", x: this.x + 25, y: this.y + 25, anchor: 'center' });
                this.h_sprite.anchor('center');
                //var gs = this.getGameState();
                //this.rotateHighLight(gs);
            }

            this.radius = this.w / 2;
            
            
            
            this.sprite = new jaws.Sprite({ image: jaws.assets.get("assets/ingame/banana.png"), x: this.x, y: this.y });
            this.createDesignerSensorMove();
            if (!this.isDesignMode) {
                var shape = new b2CircleShape((this.w / 2) / VK.Box2D.WORLD_SCALE);
                var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
                fixture.isSensor = true;
                fixture.shape = shape;
                var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x + (this.w / 2)), (this.y + (this.h / 2)), { Name: this.name, Entity: this });
                this.b2Body = this.b2World.CreateBody(bodyDef);
                this.b2Body.CreateFixture(fixture);
            }
            return this;
        },
        //rotateHighLight: function (gs) {
        //    gs.createTimer(200,
        //           function callback_timeout() {
        //               this.rotateHighLight(gs);
        //           }.bind(this),
        //           null,
        //           null
        //       );
        //},
        update: function (timeDelta) {
            if (this.impactEmitter) {
                this.impactEmitter.x = this.x + (this.getWidth() / 2);
                this.impactEmitter.y = this.y + (this.getHeight() / 2);
                this.impactEmitter.update(timeDelta);
            }
            
            if (this.h_sprite) {
                this.h_sprite.rotate(0.5);
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

            if (this.h_sprite) {
                this.h_sprite.draw(ctx);
            }
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

    VK.GameHelper.setXtype('BANANA', VK.InGame.Banana, { toolIndex: 1, instancesTotal: 1 });

})();