/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {

    if (!VK.InGame.EntitiesEnemies) {
        VK.InGame.EntitiesEnemies = {};
    };




    var _beeAnim = null;

    var getBeeAnimation = function (name) {
        if (_beeAnim) {
            _beeAnim.index = 0;
            return _beeAnim;
        }

        _beeAnim = new jaws.Animation({
            sprite_sheet: jaws.assets.get("assets/ingame/bee.png"),
            frame_size: [64, 73], frame_duration: 100, orientation: 'right', cacheKey: name
        });

        return _beeAnim;
    };
    
    VK.InGame.EntitiesEnemies.Bee = VK.Entity.extend({
        b2World: null,
        w: 64,
        h: 73,
        name: 'bee',
        moveSensorRadius: 73 / 2,
        direction: 1,
        directionXY: 'X',
        routeDistance: 150,
        isFital: function () { return true; },
        canRotate: function () {
            return false;
        },
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
        createBody: function () {
            var shape = new b2CircleShape(this.w / 2 / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
            fixture.isSensor = true;
            fixture.shape = shape;
            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_kinematicBody, (this.x), (this.y), { Name: this.name, Entity: this });
            var body = this.b2World.CreateBody(bodyDef);
            body.CreateFixture(fixture);

            return body;
        },
        init: function (options) {
            this._super(options);
            this.anim = getBeeAnimation(this.name);

            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
            this.createDesignerSensorMove();


            this.theta = 0.025;
            
            if (!this.isDesignMode) {
                this.origX = this.x;
                this.origY = this.y;

                this.theta = [.025, 10, 20, 30].random();

                

                this.b2Body = this.createBody();
            }
        },
        update: function (timeDelta) {
            this.sprite.setImage(this.anim.next());
            if (!this.isDesignMode) {
                //this.theta = 0.025;
                var b2v = null;
                
                var p = this.getPosition();

                var dx = p.x - this.origX;
                // absolute
                dx = dx & 0x8000 ? ~dx + 1 : dx;

                if (dx > this.routeDistance) {
                    this.direction *= -1;
                }

                this.flipped = this.b2Body.GetLinearVelocity().x < 0;
                
                if (this.directionXY == 'X') {
                    b2v = new b2Vec2(Math.cos(this.theta * Math.PI / 180) * this.direction, 0);
                }
                else {
                    b2v = new b2Vec2(0, Math.cos(this.theta * Math.PI / 180) * this.direction);
                }
                this.b2Body.SetLinearVelocity(b2v);
            }
            this._super(timeDelta);
        },
        draw: function (ctx, timeDelta) {
            var sprite = this.sprite;
            this._super(ctx, timeDelta);
            ctx.save();
            ctx.translate(sprite.x, sprite.y);
            this.flipped && ctx.scale(-1, 1);
            ctx.globalAlpha = 1;
            ctx.translate(-sprite.left_offset, -sprite.top_offset); // Needs to be separate from above translate call cause of flipped
            ctx.drawImage(sprite.image, 0, 0, sprite.width, sprite.height, -(sprite.width / 2), -(sprite.height / 2), this.w, this.h);
            ctx.restore();
        }
    });
    VK.GameHelper.setXtype('bee', VK.InGame.EntitiesEnemies.Bee, { toolIndex: 1, instancesTotal: 20 });



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    var _plantAnim = null;

    var getPlantEaterAnimation = function (name) {
        if (_plantAnim) {
            _plantAnim.index = 0;
            return _plantAnim;
        }

        _plantAnim = new jaws.Animation({
            sprite_sheet: jaws.assets.get("assets/ingame/plant_eater.png"),
            frame_size: [82, 70], frame_duration: 300, orientation: 'right', cacheKey: name
        });

        return _plantAnim;
    };

    VK.InGame.EntitiesEnemies.PlantEater = VK.Entity.extend({
        b2World: null,
        w: 82 - 82 * .3,
        h: 70 - 70 * .3,
        name: 'plant_eater',
        moveSensorRadius: (82 - 82 * .3) / 2,
        direction: 1,
        directionXY: 'X',
        routeDistance: 100,
        isFital: function () { return true; },
        canRotate: function () {
            return false;
        },
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
        createBody: function () {
            var shape = new b2CircleShape(this.w / 2 / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
            fixture.isSensor = true;
            fixture.shape = shape;
            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_kinematicBody, (this.x), (this.y), { Name: this.name, Entity: this });
            var body = this.b2World.CreateBody(bodyDef);
            body.CreateFixture(fixture);

            return body;
        },
        init: function (options) {
            this._super(options);
            this.anim = getPlantEaterAnimation(this.name);

            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
            this.createDesignerSensorMove();


            this.theta = 0.025;

            if (!this.isDesignMode) {
                this.origX = this.x;
                this.origY = this.y;

                this.theta = [.025, 10, 20, 30].random();



                this.b2Body = this.createBody();
            }
        },
        update: function (timeDelta) {
            this.sprite.setImage(this.anim.next());
            if (!this.isDesignMode) {
                //this.theta = 0.025;
                var b2v = null;

                var p = this.getPosition();

                var dx = p.x - this.origX;
                // absolute
                dx = dx & 0x8000 ? ~dx + 1 : dx;

                if (dx > this.routeDistance) {
                    this.direction *= -1;
                }

                this.flipped = this.b2Body.GetLinearVelocity().x > 0;

                if (this.directionXY == 'X') {
                    b2v = new b2Vec2(Math.cos(this.theta * Math.PI / 180) * this.direction, 0);
                }
                else {
                    b2v = new b2Vec2(0, Math.cos(this.theta * Math.PI / 180) * this.direction);
                }
                this.b2Body.SetLinearVelocity(b2v);
            }
            this._super(timeDelta);
        },
        draw: function (ctx, timeDelta) {
            var sprite = this.sprite;
            this._super(ctx, timeDelta);
            ctx.save();
            ctx.translate(sprite.x, sprite.y);
            this.flipped && ctx.scale(-1, 1);
            ctx.globalAlpha = 1;
            ctx.translate(-sprite.left_offset, -sprite.top_offset); // Needs to be separate from above translate call cause of flipped
            ctx.drawImage(sprite.image, 0, 0, sprite.width, sprite.height, -(sprite.width / 2) + 10, -(sprite.height / 2) + 10, this.w, this.h);
            ctx.restore();
        },
        drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
            context.arc(sprite.x - 10, sprite.y - 10, radius, Math.PI * 0, Math.PI * 2);
        }
    });
    VK.GameHelper.setXtype('plant_eater', VK.InGame.EntitiesEnemies.PlantEater, { toolIndex: 1, instancesTotal: 20, scope: (VK.isDebugMode() ? VK.CONSTANT.ENTITY_SCOPE.PUBLIC : VK.CONSTANT.ENTITY_SCOPE.PROTECTED) });













})();