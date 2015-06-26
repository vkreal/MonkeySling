/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {

    if (!VK.InGame.Ball) {
        VK.InGame.Ball = {};
    };

    // base class for balls
    VK.InGame.Ball.__BASE = VK.Entity.extend({
        b2Body: null,
        // set defaults w, h. can override from options and resource info
        w: 36,
        h: 36,
        moveSensorRadius: 16,
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
        getToolbarIcon: function () {
            return this.canvas;
        },
        init: function (options) {
            this.spriteDef = VK.Canvas.getImageDef(this.name);
            if (!options.w && !this.getWidth()) {
                options.w = this.spriteDef['w'];
            }
            if (!options.h && !this.getHeight()) {
                options.h = this.spriteDef['h'];
            }
            this._super(options);
            this.canvas = VK.Canvas.cutImage(jaws.assets.get("assets/ingame/sportsballs.png"), this.name, this.getWidth(), this.getHeight());
            this.setup(b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
            this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
        },
        canRotate: function () {
            return false;
        },
        setup: function (type, userData) {
            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }
            var fixture = VK.Box2dUtils.generateCircleB2FixtureDef(this.getWidth() / 2, 0.5, 1, 0.7);
            var bodyDef = VK.Box2dUtils.generateB2BodyDef(type, this.x, this.y, userData);
            this.b2Body = this.b2World.CreateBody(bodyDef);
            this.b2Body.CreateFixture(fixture);
        },
        draw: function (ctx, timeDelta, hitTest) {
            this._super(ctx, timeDelta, hitTest);
            var context = ctx;
            var sprite = this.sprite;
            context.save()
            context.translate(sprite.x, sprite.y);
            if (this.sprite.angle != 0) {
                ctx.rotate(this.sprite.angle);
            }
            var height = this.getHeight();
            var width = this.getWidth();
            context.globalAlpha = sprite.alpha;
            context.translate(-sprite.left_offset, -sprite.top_offset);
            context.drawImage(sprite.image, -(sprite.width - width / 2), -(sprite.height - height / 2), width, height);
            context.restore();
        }
    });
    VK.InGame.Ball.Soccer = VK.InGame.Ball.__BASE.extend({
        name: 'soccerball'
    });
    VK.GameHelper.setXtype('soccerball', VK.InGame.Ball.Soccer);

    VK.InGame.Ball.Basket = VK.InGame.Ball.__BASE.extend({
        name: 'basketball'
    });
    VK.GameHelper.setXtype('basketball', VK.InGame.Ball.Basket);

    VK.InGame.Ball.Beach = VK.InGame.Ball.__BASE.extend({
        name: 'beachball'
    });
    VK.GameHelper.setXtype('beachball', VK.InGame.Ball.Beach);

    VK.InGame.Ball.Tennis = VK.InGame.Ball.__BASE.extend({
        w: 26,
        h: 26,
        name: 'tennisball'
    });
    VK.GameHelper.setXtype('tennisball', VK.InGame.Ball.Tennis);

    

})();