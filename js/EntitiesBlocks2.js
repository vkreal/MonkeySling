/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    if (!VK.Block2) {
        VK.Block2 = {};
    };
    // base class for blocks
    VK.Block2.__BASE = VK.Entity.extend({
        hardness: 8,   // amount of force needed to break
        hit: 0,         // 0-3  block stage for block break
        breakable: true,
        b2Body: null,
        //spriteSheetNamePre: '',
        getToolbarIcon: function () {
            return this.canvas;
        },
        init: function (options) {
            this.spriteDef = VK.Canvas.getImageDef(this.spriteSheetNamePre + (1));
            if (!options.w && !this.getWidth()) {
                options.w = this.spriteDef['w'];
            }
            if (!options.h && !this.getHeight()) {
                options.h = this.spriteDef['h'];
            }
            this._super(options);
            this.canvas = this.getCanvasImage();
            this.setup(this.type != undefined ? this.type : b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
            this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
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
            context.globalAlpha = sprite.alpha;
            context.translate(-sprite.left_offset, -sprite.top_offset);
            context.drawImage(sprite.image, -(sprite.width - this.getWidth() / 2), -(sprite.height - this.getHeight() / 2), this.getWidth(), this.getHeight());
            context.restore();
        },
        getCanvasImage: function () {
            var h = this.hit;
            if (h > 3) {
                h = 3;
            }
            return VK.Canvas.cutImage(jaws.assets.get(this.spriteDef.URL), this.spriteSheetNamePre + (h + 1), this.getWidth(), this.getHeight());
        },
        maxHitBeforeDestroy: 9,
        applyDamage: function () {
            this.hit += 1;
            // replace bitmap
            this.maxHitBeforeDestroy = this.maxHitBeforeDestroy - 1;
            if (this.hit > this.maxHitBeforeDestroy && this.type !== b2Body.b2_staticBody) {
                this.deactivate();
                var tnt = new VK.InGame.Effect.BlockDestroy({ x: this.sprite.x - (this.sprite.width), y: this.sprite.y - (this.sprite.height) });
                this.getGameState().addEntity(tnt);
            }

            this.sprite.image = this.getCanvasImage();
        },
        collisionSoundTimer: function () {

        },
        update: function () {
            this._super();
            if (this.isDesignMode) { return; }
            if (this.getReversGravity() && this.b2Body) {
                var anti_gravity = new b2Vec2(0.0, -20.0 * this.b2Body.GetMass());
                this.b2Body.ApplyForce(anti_gravity, this.b2Body.GetWorldCenter());
            }
        },
        postSolve: function (contact, impulse) {
            if (this.breakable && impulse.normalImpulses[0] > this.hardness) {
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'block_collision' });
                // assess damage here!!!
                //console.debug('impact: ' + impulse.normalImpulses[0]);
                this.applyDamage();
            }
        }
    });

    ///////////////////////////////////
    // base class for ball blocks
    ///////////////////////////////////
    VK.Block2.Ball_BASE = VK.Block2.__BASE.extend({
        // set defaults w, h. can override from options and resource info
        w: 32,
        h: 32,
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

        canRotate: function () {
            return false;
        },
        setup: function (type, userData) {
            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }
            var fixture = VK.Box2dUtils.generateCircleB2FixtureDef(this.getWidth() / 2, 0.5, 1, 0.1);
            var bodyDef = VK.Box2dUtils.generateB2BodyDef(type, this.x, this.y, userData);
            this.b2Body = this.b2World.CreateBody(bodyDef);
            this.b2Body.CreateFixture(fixture);
        }
    });

    ///////////////////////////////////
    // base class for rectangle blocks
    ///////////////////////////////////
    VK.Block2.Rectangle_BASE = VK.Block2.__BASE.extend({
        // set defaults w, h. can override from options and resource info
        w: 84,
        h: 42,

        createDesignerSensorRotate: function () {
            if (this.moveSensorRadius && this.canRotate() && this.isDesignMode && this.b2World) {
                this.bodyRotate = this.createDesignerSensorBody((this.moveSensorRadius * 2) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.ROTATE });
            }
        },
        moveSensorRadius: 84 / 2,
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

        setup: function (type, userData) {
            this.createDesignerSensorMove();
            if (this.isDesignMode) { return; }
            this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, type, this.angle, userData);
        }
    });
    VK.Block2.Long_Rectangle_BASE = VK.Block2.Rectangle_BASE.extend({
        // set defaults w, h. can override from options and resource info
        createDesignerSensorRotate: function () {
            if (this.moveSensorRadius && this.canRotate() && this.isDesignMode && this.b2World) {
                this.bodyRotate = this.createDesignerSensorBody((this.moveSensorRadius * 2.5) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.ROTATE });
            }
        },
        w: 240,
        h: 20
    });
    // Hollow Square
    VK.Block2.Hollow_Square_BASE = VK.Block2.Rectangle_BASE.extend({
        // set defaults w, h. can override from options and resource info
        w: 50,
        h: 50
    });
    // Hollow Long
    VK.Block2.Hollow_Long_BASE = VK.Block2.Rectangle_BASE.extend({
        // set defaults w, h. can override from options and resource info
        w: 50,
        h: 82
    });
    // Square
    VK.Block2.Square_BASE = VK.Block2.Rectangle_BASE.extend({
        // set defaults w, h. can override from options and resource info
        w: 50,
        h: 50
    });

})();
(function () {
    // BALL
    VK.Block2.Ice_Ball = VK.Block2.Ball_BASE.extend({
        name: 'Ice_Ball',
        spriteSheetNamePre: 'Ice Ball-0'
    });
    VK.GameHelper.setXtype('Ice_Ball',  VK.Block2.Ice_Ball);

    VK.Block2.Metal_Ball = VK.Block2.Ball_BASE.extend({
        hardness: 12,   // amount of force needed to break
        name: 'Metal_Ball',
        spriteSheetNamePre: 'Metal Ball-0'
    });
    VK.GameHelper.setXtype('Metal_Ball',  VK.Block2.Metal_Ball);

    VK.Block2.Stone_Ball = VK.Block2.Ball_BASE.extend({
        name: 'Stone_Ball',
        spriteSheetNamePre: 'Stone Ball-0'
    });
    VK.GameHelper.setXtype('Stone_Ball',  VK.Block2.Stone_Ball);

    VK.Block2.Wood_Ball = VK.Block2.Ball_BASE.extend({
        name: 'Wood_Ball',
        spriteSheetNamePre: 'Wood Ball-0'
    });
    VK.GameHelper.setXtype('Wood_Ball',  VK.Block2.Wood_Ball);
})();


(function () {
    VK.Block2.Metal_Hollow_Square = VK.Block2.Hollow_Square_BASE.extend({
        name: 'Metal_Hollow_Square',
        spriteSheetNamePre: 'Metal Hollow Square-0'
    });
    VK.GameHelper.setXtype('Metal_Hollow_Square',  VK.Block2.Metal_Hollow_Square);

    VK.Block2.Ice_Hollow_Square = VK.Block2.Hollow_Square_BASE.extend({
        name: 'Ice_Hollow_Square',
        spriteSheetNamePre: 'Ice Hollow Square-0'
    });
    VK.GameHelper.setXtype('Ice_Hollow_Square',  VK.Block2.Ice_Hollow_Square);
    
    VK.Block2.Stone_Hollow_Square = VK.Block2.Hollow_Square_BASE.extend({
        name: 'Stone_Hollow_Square',
        spriteSheetNamePre: 'Stone Hollow Square-0'
    });
    VK.GameHelper.setXtype('Stone_Hollow_Square',  VK.Block2.Stone_Hollow_Square);

    VK.Block2.Wood_Hollow_Square = VK.Block2.Hollow_Square_BASE.extend({
        name: 'Wood_Hollow_Square',
        spriteSheetNamePre: 'Wood Hollow Square-0'
    });
    VK.GameHelper.setXtype('Wood_Hollow_Square',  VK.Block2.Wood_Hollow_Square);


    /////////////////// LONG //////////////////////////////////////////////
    VK.Block2.Metal_Hollow_Long = VK.Block2.Hollow_Long_BASE.extend({
        name: 'Metal_Hollow_Long',
        spriteSheetNamePre: 'Metal Hollow Long-0'
    });
    VK.GameHelper.setXtype('Metal_Hollow_Long',  VK.Block2.Metal_Hollow_Long);

    VK.Block2.Ice_Hollow_Long = VK.Block2.Hollow_Long_BASE.extend({
        name: 'Ice_Hollow_Long',
        spriteSheetNamePre: 'Ice Hollow Long-0'
    });
    VK.GameHelper.setXtype('Ice_Hollow_Long',  VK.Block2.Ice_Hollow_Long);
    
    VK.Block2.Stone_Hollow_Long = VK.Block2.Hollow_Long_BASE.extend({
        name: 'Stone_Hollow_Long',
        spriteSheetNamePre: 'Stone Hollow Long-0'
    });
    VK.GameHelper.setXtype('Stone_Hollow_Long',  VK.Block2.Stone_Hollow_Long);

    VK.Block2.Wood_Hollow_Long = VK.Block2.Hollow_Long_BASE.extend({
        name: 'Wood_Hollow_Long',
        spriteSheetNamePre: 'Wood Hollow Long-0'
    });
    VK.GameHelper.setXtype('Wood_Hollow_Long',  VK.Block2.Wood_Hollow_Long);


})();

(function () {
    // Square
    VK.Block2.Metal_Square = VK.Block2.Square_BASE.extend({
        name: 'Metal_Square',
        spriteSheetNamePre: 'Metal Square-0'
    });
    VK.GameHelper.setXtype('Metal_Square',  VK.Block2.Metal_Square);

    VK.Block2.Ice_Square = VK.Block2.Square_BASE.extend({
        name: 'Ice_Square',
        spriteSheetNamePre: 'Ice Square-0'
    });
    VK.GameHelper.setXtype('Ice_Square',  VK.Block2.Ice_Square);
    
    VK.Block2.Stone_Square = VK.Block2.Square_BASE.extend({
        name: 'Stone_Square',
        spriteSheetNamePre: 'Stone Square-0'
    });
    VK.GameHelper.setXtype('Stone_Square',  VK.Block2.Stone_Square);
    
    VK.Block2.Wood_Square = VK.Block2.Square_BASE.extend({
        name: 'Wood_Square',
        spriteSheetNamePre: 'Wood Square-0'
    });
    VK.GameHelper.setXtype('Wood_Square',  VK.Block2.Wood_Square);


     // Rectangle
    VK.Block2.Metal_Rectangle = VK.Block2.Rectangle_BASE.extend({
        name: 'Metal_Rectangle',
        spriteSheetNamePre: 'Metal Rectangle-0'
    });
    VK.GameHelper.setXtype('Metal_Rectangle',  VK.Block2.Metal_Rectangle);

    VK.Block2.Ice_Rectangle = VK.Block2.Rectangle_BASE.extend({
        name: 'Ice_Rectangle',
        spriteSheetNamePre: 'Ice Rectangle-0'
    });
    VK.GameHelper.setXtype('Ice_Rectangle',  VK.Block2.Ice_Rectangle);
    
    VK.Block2.Stone_Rectangle = VK.Block2.Rectangle_BASE.extend({
        name: 'Stone_Rectangle',
        spriteSheetNamePre: 'Stone Rectangle-0'
    });
    VK.GameHelper.setXtype('Stone_Rectangle',  VK.Block2.Stone_Rectangle);
    
    VK.Block2.Wood_Rectangle = VK.Block2.Rectangle_BASE.extend({
        name: 'Wood_Rectangle',
        spriteSheetNamePre: 'Wood Rectangle-0'
    });
    VK.GameHelper.setXtype('Wood_Rectangle',  VK.Block2.Wood_Rectangle);
    
    // Long Rectangle
    VK.Block2.Metal_Long_Rectangle = VK.Block2.Long_Rectangle_BASE.extend({
        name: 'Metal_Long_Rectangle',
        spriteSheetNamePre: 'Metal Long Rectangle-0'
        //,type: b2Body.b2_staticBody
    });
    VK.GameHelper.setXtype('Metal_Long_Rectangle',  VK.Block2.Metal_Long_Rectangle);

    VK.Block2.Ice_Long_Rectangle = VK.Block2.Long_Rectangle_BASE.extend({
        name: 'Ice_Long_Rectangle',
        spriteSheetNamePre: 'Ice Long Rectangle-0'
    });
    VK.GameHelper.setXtype('Ice_Long_Rectangle',  VK.Block2.Ice_Long_Rectangle);

    VK.Block2.Stone_Long_Rectangle = VK.Block2.Long_Rectangle_BASE.extend({
        name: 'Stone_Long_Rectangle',
        spriteSheetNamePre: 'Stone Long Rectangle-0'
    });
    VK.GameHelper.setXtype('Stone_Long_Rectangle',  VK.Block2.Stone_Long_Rectangle);

    VK.Block2.Wood_Long_Rectangle = VK.Block2.Long_Rectangle_BASE.extend({
        name: 'Wood_Long_Rectangle',
        spriteSheetNamePre: 'Wood Long Rectangle-0'
    });
    VK.GameHelper.setXtype('Wood_Long_Rectangle', VK.Block2.Wood_Long_Rectangle);


    
    //VK.Block2.Platform_Concept2 = VK.Entity.extend({
    //    breakable: false,
    //    b2Body: null,
    //    w: 180,
    //    h: 30,
    //    name: 'Platform_Concept2',
    //    //spriteSheetNamePre: '',
    //    getToolbarIcon: function () {
    //        return this.canvas;
    //    },
    //    init: function (options) {
    //        this._super(options);
    //        this.canvas = this.getCanvasImage();
    //        this.setup(this.type != undefined ? this.type : b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
    //        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
    //    },
    //    draw: function (ctx, timeDelta, hitTest) {
    //        this._super(ctx, timeDelta, hitTest);
    //        var context = ctx;
    //        var sprite = this.sprite;
    //        context.save()
    //        context.translate(sprite.x, sprite.y);
    //        if (this.sprite.angle != 0) {
    //            ctx.rotate(this.sprite.angle);
    //        }
    //        context.globalAlpha = sprite.alpha;
    //        context.translate(-sprite.left_offset, -sprite.top_offset);
    //        context.drawImage(sprite.image, -(sprite.width - this.getWidth() / 2), -(sprite.height - this.getHeight() / 2), this.getWidth(), this.getHeight());
    //        context.restore();
    //    },
    //    setup: function (type, userData) {
    //        if (this.isDesignMode) { return; }
    //        this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, b2Body.b2_staticBody, this.angle, userData);
    //    },
    //    getCanvasImage: function () {
    //        return jaws.assets.get("assets/ingame/test/Platform_concept2.png");
    //    }
    //});
    
    //VK.GameHelper.setXtype('Platform_Concept2', VK.Block2.Platform_Concept2);

    //VK.Block2.Platform_Concept3 = VK.Block2.Platform_Concept2.extend({
    //    w: 171,
    //    h: 60,
    //    name: 'Platform_Concept3',
    //    getCanvasImage: function () {
    //        return jaws.assets.get("assets/ingame/test/Platform_concept3.png");
    //    },
    //    setup: function (type, userData) {
    //        if (this.isDesignMode) { return; }
    //        this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, 30 / 2, this.x, this.y, b2Body.b2_staticBody, this.angle, userData);
    //    },
    //});
    //VK.GameHelper.setXtype('Platform_Concept3', VK.Block2.Platform_Concept3);


    //VK.Block2.Rock_Concept = VK.Block2.Ball_BASE.extend({
    //    w: 36,
    //    h: 36,
    //    init: function (options) {
    //        this._super(options);

    //        // override
    //        var qs_rocksize = VK.GameHelper.getUrlParameterByName('rocksize');
    //        if (qs_rocksize) {
    //            this.w = parseInt(qs_rocksize);
    //            this.h = this.w;
    //        }
    //       // w: 36,
    //       // h: 36,
            
    //    },
    //    hardness: 8,   // amount of force needed to break
    //    name: 'rock_concept',
    //    spriteSheetNamePre: 'rock',
    //    update: function (timeDelta) {
    //        this._super(timeDelta);
    //        if (this.anim) {
    //            if (this.anim.atLastFrame()) {
    //                this.deactivate();
    //            }
    //            else {
    //                this.sprite.setImage(this.anim.next());
    //            }
    //        }
    //        if (this.m_deativateB2Body === true && this.b2Body) {
    //            this.b2World.DestroyBody(this.b2Body);
    //            this.b2Body = null;
    //        }
    //    },
    //    applyDamage: function () {
    //        this.hit += 1;
    //        // replace bitmap
    //        if (this.hit > 3 && !this.anim) {
    //            var URL = VK.Canvas.getImageDef("rock_break").URL;
    //            var sprite = VK.Canvas.cutImage(jaws.assets.get(URL), "rock_break", this.w * 7, this.w);
    //            this.m_deativateB2Body = true;
    //            this.anim = new jaws.Animation({ sprite_sheet: sprite, frame_size: [this.w, this.w], frame_duration: 125, orientation: 'right' });
    //        }
    //        else {
    //            this.sprite.image = this.getCanvasImage();
    //        }
    //    }
    //});

    //VK.GameHelper.setXtype('rock_concept', VK.Block2.Rock_Concept);

})();