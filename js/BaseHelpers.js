/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {


    VK.Point = function () {
        var ctor = function (x, y) {
            var _self = this;
            x = x == null ? 0 : x;
            y = y == null ? 0 : y;
            _self.x = x;
            _self.y = y
        };
        ctor.distance = function (pt1, pt2) {
            var dx = pt2.x - pt1.x;
            var dy = pt2.y - pt1.y;
            return Math.sqrt(dx * dx + dy * dy)
        };
        return ctor
    } ();

    VK.Box2dUtils = {
        generateRope: function (b2world, bodyA, bodyB, links, ropeWidth, ropeLength, userData) {
            var xpos = bodyA.GetPosition().x * VK.Box2D.WORLD_SCALE;
            var ypos = bodyA.GetPosition().y * VK.Box2D.WORLD_SCALE;

            // according to the number of links, I am setting the length of a single chain piace
            var chainLength = ropeLength / links;

            var polygonShape = new b2PolygonShape();
            polygonShape.SetAsBox(ropeWidth / VK.Box2D.WORLD_SCALE, chainLength / VK.Box2D.WORLD_SCALE);
            // link fixture;
            var fixtureDef = VK.Box2dUtils.generateB2FixtureDef(10, 1, 0.5);
            fixtureDef.shape = polygonShape;

            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_dynamicBody, 2, chainLength, userData);

            for (var i = 0; i < links; i++) {
                bodyDef.position.Set((xpos + 20) / VK.Box2D.WORLD_SCALE, (ypos + (chainLength + 2 * chainLength * i)) / VK.Box2D.WORLD_SCALE);
                if (i == 0) {
                    var link = b2world.CreateBody(bodyDef);
                    link.SetBullet(true);
                    link.CreateFixture(fixtureDef);
                    this.generateRevoluteJoint(b2world, bodyA, link, new b2Vec2(0, 0), new b2Vec2(0, -chainLength / VK.Box2D.WORLD_SCALE));
                }
                else {
                    var newLink = b2world.CreateBody(bodyDef);
                    newLink.SetBullet(true);
                    newLink.CreateFixture(fixtureDef);
                    this.generateRevoluteJoint(b2world, link, newLink, new b2Vec2(0, chainLength / VK.Box2D.WORLD_SCALE), new b2Vec2(0, -chainLength / VK.Box2D.WORLD_SCALE));
                    link = newLink;
                }
            }
            // TODO: ????? TAKE ANOTHER LOOK HERE
            if (bodyB) {
                this.generateRevoluteJoint(link, bodyB, new b2Vec2(0, chainLength / VK.Box2D.WORLD_SCALE), new b2Vec2(0, 0));
            }
        },
        generateRevoluteJoint: function (b2world, bodyA, bodyB, anchorA, anchorB) {
            var revoluteJointDef = new b2RevoluteJointDef();
            revoluteJointDef.localAnchorA.Set(anchorA.x, anchorA.y);
            revoluteJointDef.localAnchorB.Set(anchorB.x, anchorB.y);
            revoluteJointDef.bodyA = bodyA;
            revoluteJointDef.bodyB = bodyB;
            b2world.CreateJoint(revoluteJointDef);
        },
        generateWall_TOP: function (b2world, w, h, px, py, userData) {
            return this.generateWall2(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData, VK.CONSTANT.WALL.TOP);
        },
        generateWall_BOTTOM: function (b2world, w, h, px, py, userData) {
            return this.generateWall2(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData, VK.CONSTANT.WALL.BOTTOM);
        },
        generateWall_LEFT: function (b2world, w, h, px, py, userData) {
            return this.generateWall2(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData, VK.CONSTANT.WALL.LEFT);
        },
        generateWall_RIGHT: function (b2world, w, h, px, py, userData) {
            return this.generateWall2(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData, VK.CONSTANT.WALL.RIGHT);
        },
        generateWall: function (b2world, w, h, px, py, userData) {
            return this.generateBox2(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData);
        },
        generateWallSensor: function(b2world, w, h, px, py, userData) 
        {
            var shape = new b2PolygonShape();
            shape.SetAsBox(w / VK.Box2D.WORLD_SCALE, h / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(0.5, 1, 0.1);
            fixture.shape = shape;
            fixture.isSensor = true;
            var bdef = this.generateB2BodyDef(b2Body.b2_staticBody, px, py, userData);
            bdef.position.Set(px / VK.Box2D.WORLD_SCALE, py / VK.Box2D.WORLD_SCALE);

            if (!b2world) {
                debugger;
                throw new Error('b2world is undefined!');
            }

            var b = b2world.CreateBody(bdef);
            b.CreateFixture(fixture);
            return b;
        },
        generateWall2: function (b2world, w, h, px, py, userData, wall_type) {
            userData = userData || {};
            userData[VK.CONSTANT.WALL.IS_WALL] = true;
            if (wall_type) {
                userData[VK.CONSTANT.WALL.WALL_TYPE] = wall_type;
            }
            return this.generateBox2(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData);
        },
        generateStaticBox: function (b2world, w, h, px, py, userData) {
            return this.generateBox(b2world, w, h, px, py, b2Body.b2_staticBody, null, userData);
        },
        generateBox: function (b2world, w, h, px, py, type, angle, userData) {
            return this.generateBox2(b2world, w, h, px, py, type, angle, userData);
        },
        generateBox2: function (b2world, w, h, px, py, type, angle, userData) {
            var shape = new b2PolygonShape();
            shape.SetAsBox(w / VK.Box2D.WORLD_SCALE, h / VK.Box2D.WORLD_SCALE);
            var fixture = VK.Box2dUtils.generateB2FixtureDef(0.5, 1, 0.1);
            fixture.shape = shape;
            var bdef = this.generateB2BodyDef(type, px, py, userData);
            if (angle !== undefined) {
                bdef.angle = angle;
            }
            bdef.position.Set(px / VK.Box2D.WORLD_SCALE, py / VK.Box2D.WORLD_SCALE);

            if (!b2world) {
                debugger;
                throw new Error('b2world is undefined!');
            }

            var b = b2world.CreateBody(bdef);
            b.CreateFixture(fixture);
            return b;
        },
        parseB2Vec2: function (x, y) {
            return new b2Vec2(x / VK.Box2D.WORLD_SCALE, y / VK.Box2D.WORLD_SCALE)
        },
        parsePoint: function (vec) {
            return new VK.Point(vec.x * VK.Box2D.WORLD_SCALE, vec.y * VK.Box2D.WORLD_SCALE)
        },
        RADIAN_TO_DEGREE: 180 / Math.PI,
        DEGREE_TO_RADIAN: Math.PI / 180,
        generateB2FixtureDef: function (density, friction, restitution) {
            var fixtureDef = new b2FixtureDef;
            fixtureDef.density = density;
            fixtureDef.friction = friction;
            fixtureDef.restitution = restitution;
            return fixtureDef
        },
        generateB2BodyDef: function (type, x, y, userData) {
            var bodyDef = new b2BodyDef();
            if (type) {
                bodyDef.type = type;
            }
            if (userData) {
                bodyDef.userData = userData;
            }
            bodyDef.position.x = x / VK.Box2D.WORLD_SCALE;
            bodyDef.position.y = y / VK.Box2D.WORLD_SCALE;
            return bodyDef;
        },
        generateCircleB2FixtureDef: function (radius, density, friction, restitution) {
            var fixtureDef = this.generateB2FixtureDef(density, friction, restitution);
            fixtureDef.shape = new b2CircleShape(radius / VK.Box2D.WORLD_SCALE);
            return fixtureDef
        },
        generatePolygonB2FixtureDef: function (points, density, friction, restitution) {
            var fixtureDef = this.generateB2FixtureDef(density, friction, restitution);
            var polygonShape = new b2PolygonShape;
            var vertices = [];
            for (var i in points) vertices.push(this.parseB2Vec2(points[i].x, points[i].y));
            polygonShape.SetAsVector(vertices);
            fixtureDef.shape = polygonShape;
            return fixtureDef
        },
        generateRectangleB2FixtureDef: function (width, height, density, friction, restitution) {
            var points = [];
            points.push(new VK.Point(-1 * width * 0.5, -1 * height * 0.5));
            points.push(new VK.Point(width * 0.5, -1 * height * 0.5));
            points.push(new VK.Point(width * 0.5, height * 0.5));
            points.push(new VK.Point(-1 * width * 0.5, height * 0.5));
            return this.generatePolygonB2FixtureDef(points, density, friction, restitution)
        }
    };

    VK.Canvas = {
        __cutImages: {},
        __imageDef: {},
        getImageDef: function (name) {
            if (this.__imageDef[name]) {
                return this.__imageDef[name];
            }
            var resourceInfo = null;
            for (var i = 0; i < VK.Resources.IMAGES.length; i++) {
                resourceInfo = VK.Resources.IMAGES[i][name];
                if (resourceInfo) {
                    if (VK.Resources.URL_MAP[i]) {
                        // look for URL for asset
                        resourceInfo.URL = VK.Resources.URL_MAP[i];
                    }
                    break;
                }
            }
            if (!resourceInfo) {
                throw new Error('can not find image info in res bundle!');
            }
            // cache it!!!
            this.__imageDef[name] = resourceInfo;
            return resourceInfo;
        },
        cutImage: function (spritesheet, name, w, h) {
            // create cache key
            var cacheKey = name;
            if (w) {
                cacheKey += w;
            }
            if (h) {
                cacheKey += h;
            }
            if (this.__cutImages[cacheKey]) {
                return this.__cutImages[cacheKey];
            }
            var resourceInfo = this.getImageDef(name);
            var cut = document.createElement("canvas")
            cut.width = w || resourceInfo['w']; // need expose outside compiler
            cut.height = h || resourceInfo['h'];
            var ctx = cut.getContext("2d");
            ctx.drawImage(spritesheet, resourceInfo['x'], resourceInfo['y'], resourceInfo['w'], resourceInfo['h'], 0, 0, cut.width, cut.height);
            this.__cutImages[cacheKey] = cut;
            return cut;
            //window.open(cut.toDataURL())
        },
        cutImage3: function (image, x, y, width, height, cacheKey) {
            if( !this.__cutImage3_cache ) {
                this.__cutImage3_cache = {};
            }
            if (cacheKey && this.__cutImage3_cache[cacheKey]) {
                return this.__cutImage3_cache[cacheKey];
            }
            var cut = document.createElement("canvas");
            cut.width = width;
            cut.height = height;

            var ctx = cut.getContext("2d");
            ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height);

            if (cacheKey) {
                this.__cutImage3_cache[cacheKey] = cut;
            }

            return cut;
        },
        cutImage2: function (name, w, h) {
            var resourceInfo = VK.Canvas.getImageDef(name);
            return this.cutImage(jaws.assets.get(resourceInfo.URL), name, w, h);
        },
        renderToCanvas: function (width, height, render, canvas, options) { // http://kaioa.com/node/103
            canvas = canvas || document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            render(canvas.getContext('2d'), options);
            return canvas;
        },
        getRandomColor: function () {
            var cssKeywords2List = VK.Color['conversions']['cssKeywords2List']();
            var randomIndex = Math.min(Math.round(Math.random() * cssKeywords2List.length), cssKeywords2List.length - 1);
            return cssKeywords2List[randomIndex]['color'];
        }
    }
})();