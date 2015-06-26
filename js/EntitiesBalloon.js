/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    // import third party Color class
    VK.Color = VK.importExternal('Color');
    /////////////////////////////////
    /////////////////////////////////

    VK.InGame.Ballon = VK.Entity.extend({
        name: VK.CONSTANT.BALLON,
        breakable: true,
        b2Body: null,
        hardness: 1.5,
        gravity: -10.02,
        moveSensorRadius: 20,
        //getAllowPointer: function () { return true; },
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
        canRotate: function () {
            return false;
        },
        getColor: function () {
            return this.color;
        },
        set2: function (options) {
            this._super(options);
            var EX = VK.CONSTANT.ENTITY_EXTERN;
            if (options[EX.COLOR]) {
                this.color = options[EX.COLOR];
            }
        },
        get: function (options) {
            options = options || {};
            this._super(options);
            var EX = VK.CONSTANT.ENTITY_EXTERN;
            if (this.getColor()) {
                options[EX.COLOR] = this.getColor();
            }
            return options;
        },
        beginContact: function (contact, b) {
            //            if (b) {
            //                var userData = b.GetUserData();
            //                if (userData) {
            //                    debugger
            //                    if (userData[VK.CONSTANT.WALL_TYPE] == VK.CONSTANT.WALL.TOP) {
            //                        alert(1)
            //                        this.gravity = Math.abs(this.gravity);
            //                    }
            //                    else if (userData[VK.CONSTANT.WALL.WALL_TYPE] == VK.CONSTANT.WALL.BOTTOM) {
            //                        alert(2)
            //                        this.gravity = -(Math.abs(this.gravity));
            //                    }
            //                }

            //            }
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

                //                var actorStar = new VK.CAAT.StarActor().initialize(this.getGameState().director, this.getGameState().scene, { x: this.sprite.x, y: this.sprite.y });
                //                // add the actor.
                //                this.getGameState().ActorContainer.addChild(actorStar);

            }
        },
        getToolbarIcon: function () {
            return this.canvas;
        },
        init: function (options) {
            // set defaults
            if (!options.w) {
                options.w = 40;
            }
            if (!options.h) {
                options.h = 55;
            }
            // end defaults
            this._super(options);
            if (!this.color) {
                // create random color if not defined
                var c = ['blue', 'red', 'yellow', 'green', 'purple'];
                this.color = c[VK.randomMax(5)];
            }
            if (!this.isDef(this.gravity)) {
                var g = [-10.020, -10.021, -10.022, -10.023, -10.024];
                this.gravity = g[VK.randomMax(5)];
            }
            this.imgSprite = jaws.assets.get("assets/ingame/balloons.png");
            this.canvas = VK.Canvas.renderToCanvas(this.getWidth(), this.getHeight(), function (ctx, option) {
                var x = 0;
                switch (option.me.color) {
                    case 'blue':
                        x = 0;
                        break;
                    case 'red':
                        x = 41;
                        break;
                    case 'yellow':
                        x = 82;
                        break;
                    case 'green':
                        x = 125;
                        break;
                    case 'purple':
                        x = 166;
                        break;
                }
                ctx.drawImage(option.me.imgSprite, x, 0, 42, 55, 0, 0, options.w, options.h);
            }, null, { me: this });

            this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }

            var shape = new b2CircleShape(this.getWidth() / 2 / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(this.density || (1 / VK.Box2D.WORLD_SCALE), 1, 0.5);
            fixture.shape = shape;

            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_dynamicBody, this.x, this.y, { Name: this.name, Entity: this });
            this.b2Body = this.b2World.CreateBody(bodyDef);
            this.b2Body.CreateFixture(fixture);

            if (this.breakable) {
                this.impactEmitter = new VK.Emitter(
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
            }

            //window.open(this.canvas.toDataURL());
        },
        update: function (timeDelta) {
            if (this.impactEmitter) {
                this.impactEmitter.x = this.sprite.x;
                this.impactEmitter.y = this.sprite.y;
                this.impactEmitter.update(timeDelta);
            }
            this._super();
            if (this.active && !this.isDesignMode) {
                this.b2Body.ApplyForce(new b2Vec2(0.0, this.gravity * this.b2Body.GetMass()), this.b2Body.GetWorldCenter());
            }
        },
        draw: function (ctx, timeDelta, hitTest) {
            if (this.impactEmitter) {
                this.impactEmitter.draw(ctx);
            }
            if (!this.active) {
                return;
            }
            var width = this.getWidth();
            var height = this.getHeight();
            var context = ctx;
            var sprite = this.sprite;
            this._super(ctx, timeDelta, hitTest);
            context.save()
            context.translate(sprite.x, sprite.y)
            //if (this.sprite.angle != 0) { jaws.context.rotate(this.sprite.angle) }
            context.globalAlpha = sprite.alpha;
            context.translate(-sprite.left_offset, -sprite.top_offset);
            context.drawImage(sprite.image, -(sprite.width - width / 2), -(sprite.height - height / 2), width, height);
            context.restore();
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
            if (this.impactEmitter) {
                this.impactEmitter.activate(200);
            }
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.BALLON, VK.InGame.Ballon);
    /////////////////////////////////////////////////////////////////////////
    VK.InGame.Ballon2 = VK.InGame.Ballon.extend({
        // Constants
        name: VK.CONSTANT.BALLON2,
        alpha: 0.7,
        KAPPA: (4 * (Math.sqrt(2) - 1)) / 3.2,
        WIDTH_FACTOR: 0.0333,
        HEIGHT_FACTOR: 0.4,
        TIE_WIDTH_FACTOR: 0.22,
        TIE_HEIGHT_FACTOR: 0.20,
        TIE_CURVE_FACTOR: 0.23,
        GRADIENT_FACTOR: 0.3,
        GRADIENT_CIRCLE_RADIUS: 3,
        //x, y, radius, color
        keyword2rgb: function (color) {
            var rgbString = VK.Color['string']['rgbString'];
            if (!color) {
                return rgbString(VK.Canvas.getRandomColor());
            }
            return rgbString(VK.Color['conversions']['keyword2rgb'](color));
        },
        set2: function (options) {
            this._super(options);
            var EX = VK.CONSTANT.ENTITY_EXTERN;
            if (options[EX.RGB]) {
                this.rgb = options[EX.RGB];
            }
            if (options[EX.RADIUS]) {
                this.radius = options[EX.RADIUS];
            }
        },
        get: function (options) {
            options = options || {};
            this._super(options);
            var EX = VK.CONSTANT.ENTITY_EXTERN;
            if (this.radius) {
                options[EX.RADIUS] = this.radius;
            }
            if (this.rgb) {
                options[EX.RGB] = this.rgb;
            }
            return options;
        },
        getToolbarIcon: function () {
            return this.canvas;
        },
        init: function (options) {
            this.set2(options);
            if (!this.rgb) {
                this.rgb = this.keyword2rgb(this.color);
            }
            this.darkColor = (new VK.Color(this.rgb))['darken'](this.GRADIENT_FACTOR);
            this.lightColor = (new VK.Color(this.rgb))['lighten'](this.GRADIENT_FACTOR);
            if (!this.radius) {
                // if not define we will generate a random radius
                var radius = [10, 20, 30, 40, 50];
                this.radius = radius[VK.randomMax(radius.length)];
                this.moveSensorRadius = this.radius;
            }
            this.setWidth(this.radius * 2);

            var width = this.getWidth();

            this.setHeight(width + (width * this.HEIGHT_FACTOR));

            // generate ballon(s)

            var height = this.getHeight();

            this.canvas = VK.Canvas.renderToCanvas(width, height, function (ctx, option) {
                option.me.renderBallonToCanvas(ctx);
            }, null, { me: this });

            this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y, alpha: this.alpha });
            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }

            var shape = new b2CircleShape(width / 2 / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(this.density || (1 / VK.Box2D.WORLD_SCALE), 1, 0.5);
            fixture.shape = shape;

            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_dynamicBody, this.x, this.y, { Name: VK.CONSTANT.BALLON, Entity: this });
            this.b2Body = this.b2World.CreateBody(bodyDef);
            this.b2Body.CreateFixture(fixture);

            if (this.breakable) {
                this.impactEmitter = new VK.Emitter(
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
            }
            //window.open(this.canvas.toDataURL())
        },
        /**
        * Draws the balloon on the canvas
        */
        renderBallonToCanvas: function (ctx) {
            if (this.canvas) { return; }

            // Prepare constants
            var centerX = this.radius;
            var centerY = this.radius;
            var radius = this.radius;

            var handleLength = this.KAPPA * radius;

            var widthDiff = (radius * this.WIDTH_FACTOR);
            var heightDiff = (radius * this.HEIGHT_FACTOR);

            var balloonBottomY = centerY + radius + heightDiff;

            // Begin balloon path

            ctx.beginPath();

            // Top Left Curve

            var topLeftCurveStartX = centerX - radius;
            var topLeftCurveStartY = centerY;

            var topLeftCurveEndX = centerX;
            var topLeftCurveEndY = centerY - radius;

            ctx.moveTo(topLeftCurveStartX, topLeftCurveStartY);
            ctx.bezierCurveTo(topLeftCurveStartX, topLeftCurveStartY - handleLength - widthDiff,
							    topLeftCurveEndX - handleLength, topLeftCurveEndY,
							    topLeftCurveEndX, topLeftCurveEndY);

            // Top Right Curve

            var topRightCurveStartX = centerX;
            var topRightCurveStartY = centerY - radius;

            var topRightCurveEndX = centerX + radius;
            var topRightCurveEndY = centerY;

            ctx.bezierCurveTo(topRightCurveStartX + handleLength + widthDiff, topRightCurveStartY,
							    topRightCurveEndX, topRightCurveEndY - handleLength,
							    topRightCurveEndX, topRightCurveEndY);

            // Bottom Right Curve

            var bottomRightCurveStartX = centerX + radius;
            var bottomRightCurveStartY = centerY;

            var bottomRightCurveEndX = centerX;
            var bottomRightCurveEndY = balloonBottomY;

            ctx.bezierCurveTo(bottomRightCurveStartX, bottomRightCurveStartY + handleLength,
							    bottomRightCurveEndX + handleLength, bottomRightCurveEndY,
							    bottomRightCurveEndX, bottomRightCurveEndY);

            // Bottom Left Curve

            var bottomLeftCurveStartX = centerX;
            var bottomLeftCurveStartY = balloonBottomY;

            var bottomLeftCurveEndX = centerX - radius;
            var bottomLeftCurveEndY = centerY;

            ctx.bezierCurveTo(bottomLeftCurveStartX - handleLength, bottomLeftCurveStartY,
							    bottomLeftCurveEndX, bottomLeftCurveEndY + handleLength,
							    bottomLeftCurveEndX, bottomLeftCurveEndY);

            // Create balloon gradient

            var gradientOffset = (radius / 3);

            var balloonGradient =
		    ctx.createRadialGradient(centerX + gradientOffset, centerY - gradientOffset,
										    this.GRADIENT_CIRCLE_RADIUS,
										    centerX, centerY, radius + heightDiff);
            balloonGradient.addColorStop(0, this.lightColor['rgbString']());
            balloonGradient.addColorStop(0.7, this.darkColor['rgbString']());

            ctx.fillStyle = balloonGradient;
            ctx.fill();

            // End balloon path

            // Create balloon tie

            var halfTieWidth = (radius * this.TIE_WIDTH_FACTOR) / 2;
            var tieHeight = (radius * this.TIE_HEIGHT_FACTOR);
            var tieCurveHeight = (radius * this.TIE_CURVE_FACTOR);

            ctx.beginPath();
            ctx.moveTo(centerX - 1, balloonBottomY);
            ctx.lineTo(centerX - halfTieWidth, balloonBottomY + tieHeight);
            ctx.quadraticCurveTo(centerX, balloonBottomY + tieCurveHeight,
								    centerX + halfTieWidth, balloonBottomY + tieHeight);
            ctx.lineTo(centerX + 1, balloonBottomY);
            ctx.fill();
        }
    });
    VK.GameHelper.setXtype(VK.CONSTANT.BALLON2, VK.InGame.Ballon2);
    /////////////////////////////////////////////////////////////////////////
})();