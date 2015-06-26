/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {

    VK.InGame.OscillatingBubble = VK.Entity.extend({
        name: VK.CONSTANT.OSCILLATING_BUBBLE,
        breakable: true,
        b2Body: null,
        alpha: 0.6,
        hardness: 0.5,
        gravity: -10.01,
        color: "#8ED6FF",
        radius: 20,
        random: true,
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
        canRotate: function () {
            return false;
        },
        postSolve: function (contact, impulse) {
            //console.debug(impulse.normalImpulses[0])
            if (this.breakable && impulse.normalImpulses[0] > this.hardness) {
                this.touchstart();
            }
        },
        touchstart: function (e) {
            if (this.breakable) {
                var gs = this.getGameState();
                if (gs) {
                    gs.playSound('balloon_pop');
                }
                this.deactivate();
            }
        },
        init: function (options) {
            this._super(options);
            // assign some random color
            if (this.random) {
                var rgbString = VK.Color['string']['rgbString'];
                var rgb = rgbString(VK.Canvas.getRandomColor());
                var lightColor = (new VK.Color(rgb))['lighten'](0.3);
                this.color = lightColor['hexString']();
            }

            this._oscillatingW = 1;
            this._oscillatingH = 1;

            if (Math.floor((Math.random() * 100)) % 2 == 0) {
                this._oscillatingW = -1;
            }
            else {
                this._oscillatingH = -1;
            }

            // create fake sprite object
            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }

            var shape = new b2CircleShape((this.radius * .9) / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(this.density || (1 / VK.Box2D.WORLD_SCALE), 1, 0.5);
            fixture.shape = shape;

            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_dynamicBody, this.x, this.y, { Name: this.name, Entity: this });
            this.b2Body = this.b2World.CreateBody(bodyDef);
            this.b2Body.CreateFixture(fixture);
        },
        update: function (timeDelta) {
            this._super();
            if (this.active && !this.isDesignMode) {
                this.b2Body.ApplyForce(new b2Vec2(0.0, this.gravity * this.b2Body.GetMass()), this.b2Body.GetWorldCenter());
            }
        },
        draw: function (ctx, timeDelta, hitTest) {
            if (!this.sprite) { return; }
            this._super(ctx, timeDelta, hitTest);
            var context = ctx;
            var radius = this.radius, x = this.sprite.x, y = this.sprite.y;
            var date = new Date();
            var time = date.getTime();

            // update
            var widthScale = this._oscillatingW * Math.sin(time / 400) * 0.1 + 0.9;
            var heightScale = this._oscillatingH * Math.sin(time / 400) * 0.1 + 0.9;

            context.globalAlpha = this.alpha;
            // draw
            context.beginPath();
            context.save();
            context.translate(x, y);
            context.scale(widthScale, heightScale);
            context.arc(0, 0, radius, 0, 2 * Math.PI, false);
            context.restore();

            context.fillStyle = this.color; // "#8ED6FF";
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = this.color; // "#8ED6FF";
            context.stroke();

            context.beginPath();
            context.save();
            context.translate(x, y);
            context.scale(widthScale, heightScale);
            context.arc(-(radius * 0.46), -(radius * 0.46), (radius * 0.23), 0, 2 * Math.PI, false);
            context.restore();
            context.fillStyle = "white";
            context.fill();
            context.stroke();

            context.beginPath();
            context.save();
            context.translate((x) - (radius * 0.15), (y) + (radius * 0.46));

            context.scale(widthScale, heightScale);
            context.arc(-(radius * 0.46), -(radius * 0.46), (radius * 0.12), 0, 2 * Math.PI, false);
            context.restore();
            context.fillStyle = "white";
            context.fill();
            context.stroke();

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

        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.OSCILLATING_BUBBLE, VK.InGame.OscillatingBubble);
    /////////////////////////////////////////////////////////////////////////

})();