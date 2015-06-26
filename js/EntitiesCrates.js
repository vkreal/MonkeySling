/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {

    ////////////////////// CRATE //////////////////////////////////////////
    VK.InGame.Crate = VK.Block.BaseBlock.extend({
        name: VK.CONSTANT.BLOCKS.CRATE,
        imgUrl: "assets/ingame/crates/crate1.png",
        createDesignerSensorRotate: function () {
            if (this.moveSensorRadius && this.canRotate() && this.isDesignMode && this.b2World) {
                this.bodyRotate = this.createDesignerSensorBody((this.moveSensorRadius * 4) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.ROTATE });
            }
        },
        moveSensorRadius: 16,
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

        getToolbarIcon: function () {
            return this.image;
        },
        init: function (options) {
            // set defaults
            if (!options.w) {
                options.w = 35;
            }
            if (!options.h) {
                options.h = 35;
            }

            this.moveSensorRadius = options.w / 2;

            this.set(options);
            this.image = jaws.assets.get(this.imgUrl);
            this.sprite = new jaws.Sprite({ image: this.image, x: this.x, y: this.y, w: this.getWidth(), h: this.getHeight() });
            this.sprite.setWidth(this.getWidth());
            this.sprite.setHeight(this.getHeight());

            this.createDesignerSensorMove();

            if (!this.isDesignMode) {
                this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, b2Body.b2_dynamicBody, this.angle, { Name: this.name, Entity: this });
            }
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.CRATE, VK.InGame.Crate);
    /////////////////////////////////////////////////////////////////////////

    VK.InGame.CrateTnT = VK.InGame.Crate.extend({
        name: VK.CONSTANT.BLOCKS.CRATE_TNT,
        hardness: 4,   // amount of force needed to break
        imgUrl: "assets/ingame/crates/cratetnt.png",
        update: function (timeDelta) {
            this.explodeEmitter.x = this.sprite.x;
            this.explodeEmitter.y = this.sprite.y;
            this.explodeEmitter.update(timeDelta);
            this._super();
        },
        draw: function (ctx, timeDelta, hitTest) {
            if (this.explodeEmitter) {
                this.explodeEmitter.draw(ctx);
            }
            if (!this.active) {
                return;
            }
            this._super(ctx, timeDelta, hitTest);
        },
        isActive: function () {
            if (this.active == false && this.explodeEmitter.active == false) {
                return false;
            }
            return true;
        },
        deactivate: function () {
            this._super();
            if (this.explodeEmitter) {
                this.explodeEmitter.activate(200);
            }
        },
        init: function (options) {
            this._super(options);
            this.explodeEmitter = new VK.Emitter(
			    0, 0, 		//x, y,
			    0, 0, 		//width, height,
			    0, 0, 		//vx, vy,
			    10, 10, 		//vxRandom, vyRandom,
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
        },
        postSolve: function (contact, impulse) {
            if (impulse.normalImpulses[0] > this.hardness) {
                // assess damage here!!!
                //console.debug('impact: ' + impulse.normalImpulses[0]);
                if (!this.m_exploded) {
                    this.explode();
                    this.m_exploded = true;
                }
            }
        },
        explode: function () {
            
            this.deactivate();

            var tnt = new VK.InGame.Effect.Explosion({ x: this.sprite.x - (this.sprite.width), y: this.sprite.y - (this.sprite.height) });
            this.getGameState().addEntity(tnt);

            var bodies = this.b2World.GetBodyList(), forceVec;
            var position = new b2Vec2(this.sprite.x / VK.Box2D.WORLD_SCALE, this.sprite.y / VK.Box2D.WORLD_SCALE);
            var b = bodies.GetNext();
            while (b) {
                //for (var i = 0; i < bodies.length; i++) {
                //b = bodies[i];
                if (b.GetType() != b2Body.b2_staticBody) {
                    var force = 25000;
                    forceVec = new b2Vec2(0, 0);
                    //if (b.GetWorldCenter() != position) {
                    var distance = b.GetWorldCenter().Copy();
                    distance.Subtract(position);
                    var r2 = 1; //(distance.Length() > 1 ? distance.LengthSquared() : 1);
                    if (distance.x > 0) forceVec.x = force / r2;
                    else if (distance.x < 0) forceVec.x = -force / r2;
                    if (distance.y > 0) forceVec.y = force / r2;
                    else if (distance.y < 0) forceVec.y = -force / r2;
                    b.ApplyForce(forceVec, b.GetWorldCenter());
                    //}
                }
                //}
                b = b.GetNext();
            }
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.CRATE_TNT, VK.InGame.CrateTnT, { toolIndex: 5, instancesTotal: 20 });

    /////////////////////////////////////////////////////////////////////////

    VK.InGame.Crate2 = VK.Block.BaseBlock.extend({
        name: VK.CONSTANT.BLOCKS.CRATE2,
        imgUrl: "assets/ingame/crates/crate0.png",
        angle: 0,
        createDesignerSensorRotate: function () {
            if (this.moveSensorRadius && this.canRotate() && this.isDesignMode && this.b2World) {
                this.bodyRotate = this.createDesignerSensorBody((this.moveSensorRadius * 4) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.ROTATE });
            }
        },
        moveSensorRadius: 16,
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
        getToolbarIcon: function () {
            return this.image;
        },
        init: function (options) {
            // set defaults
            if (!options.w) {
                options.w = 45;
            }
            if (!options.h) {
                options.h = 45;
            }
            this.set(options);
            this.image = jaws.assets.get(this.imgUrl);
            this.sprite = new jaws.Sprite({ image: this.image, x: this.x, y: this.y, w: this.getWidth(), h: this.getHeight() });
            this.sprite.setWidth(this.getWidth());
            this.sprite.setHeight(this.getHeight());
            this.createDesignerSensorMove();
            if (!this.isDesignMode) {
                this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, b2Body.b2_dynamicBody, this.angle, { Name: this.name, Entity: this });
            }
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.CRATE2, VK.InGame.Crate2);
    /////////////////////////////////////////////////////////////////////////

})();