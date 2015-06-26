/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {

    VK.Platform = {};

    VK.Platform.__BASE = VK.Entity.extend({
        b2Body: null,
        name: 'platform1-small',
        canRotate: function () { return true; },

        createDesignerSensorRotate: function () {
            if (this.moveSensorRadius && this.canRotate() && this.isDesignMode && this.b2World) {
                this.bodyRotate = this.createDesignerSensorBody((this.moveSensorRadius * 2) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.ROTATE });
            }
        },
        //moveSensorRadius: 84 / 2,
        createDesignerSensorBodyDef: function (userData) {
            return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x), (this.y), userData);
        },
        _setPositionAndAngle: function (b) {
            if (b) {
                b.SetPositionAndAngle(
                    new b2Vec2((this.x) / VK.Box2D.WORLD_SCALE, (this.y) / VK.Box2D.WORLD_SCALE),
                    0
                );
            }
        },

        init: function (options) {
            this.spriteDef = VK.Canvas.getImageDef(this.name);

            this.w = this.spriteDef['w'];
            this.h = this.spriteDef['h'];
            this._super(options);
            this.canvas = this.getCanvasImage();
            this.setup(b2Body.b2_staticBody, { Name: this.name, Entity: this });
            this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
        },
        draw: function (ctx, timeDelta) {
            this._super(ctx, timeDelta);
            var context = ctx;
            var sprite = this.sprite;
            context.save();
            context.translate(sprite.x, sprite.y);
            if (sprite.angle != 0) {
                ctx.rotate(sprite.angle);
            }
            context.globalAlpha = sprite.alpha;
            context.translate(-sprite.left_offset, -sprite.top_offset);
            context.drawImage(sprite.image, -(sprite.width - sprite.width / 2), -(sprite.height - sprite.height / 2), sprite.width, sprite.height);
            context.restore();
        },
        setup: function (type, userData) {
            if (this.isDesignMode) { return; }
            this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, type, this.angle, userData);
        },
        getCanvasImage: function () {
            return VK.Canvas.cutImage(jaws.assets.get(this.spriteDef.URL), this.name);
        }
    });
    
    VK.Platform.SMALL_GRASS_GROUND = VK.Platform.__BASE.extend({
        name: 'small_grass_ground',
        init: function (options) {
            this._super(options);
            this.moveSensorRadius = 48;
            this.createDesignerSensorMove();
        }
    });
    VK.GameHelper.setXtype('small_grass_ground', VK.Platform.SMALL_GRASS_GROUND, { toolIndex: 4, instancesTotal: 10 });

})();