/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

VK.Block.BaseBlock = VK.Entity.extend({
    hardness: 5,   // amount of force needed to break
    hit: 0,         // 0-3  block stage for block break
    b2Body: null,
    init: function (options) {
        this._super(options);
        // NOTE PUT THIS BACK TO SEE OLD SAMPLE BLOCKS
        //this.image = jaws.assets.get("assets/INGAME_BLOCKS_BASIC.png");
        this.setBitMap(this.hit);
    },
    applyDamage: function () {
        this.hit += 1;
        this.setBitMap(this.hit);
        // replace bitmap
        this.sprite.image = this.canvas;
    },
    setBitMap: function () { },
    postSolve: function (contact, impulse) {
        if (this.isBreakable() && impulse.normalImpulses[0] > this.hardness) {
            // assess damage here!!!
            //console.debug('impact: ' + impulse.normalImpulses[0]);
            this.applyDamage();
        }
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
    },
    setup: function (type, userData) {
        if (this.isDesignMode) { return; }
        this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, type, this.angle, userData);
    }
});


VK.Block.RoundBlockBase = VK.Block.BaseBlock.extend({
    name: '',
    init: function (options) {
        this._super(options);
        this.setup(this.type != undefined ? this.type : b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
    },
    setBitMapHelper: function (x, y, w, h) {
        this.canvas = VK.Canvas.renderToCanvas(this.getWidth(), this.getHeight(), function (ctx, option) {
            ctx.drawImage(option.me.image, x, y, w, h, 0, 0, option.me.w, option.me.h);
        }, null, { me: this });
    },
    setup: function (type, userData) {
        if (this.isDesignMode) { return; }
        var fixture = VK.Box2dUtils.generateCircleB2FixtureDef(this.getWidth() / 2, 0.5, 1, 0.1);
        var bodyDef = VK.Box2dUtils.generateB2BodyDef(type, this.x + (this.getWidth() / 2), (this.y + (this.getHeight() / 2)), userData);
        this.b2Body = this.b2World.CreateBody(bodyDef);
        this.b2Body.CreateFixture(fixture);
    },
    setBitMap: function (i) {
    }
});

VK.Block.CubeBlockBase = VK.Block.BaseBlock.extend({
    name: '',
    init: function (options) {
        this._super(options);
        this.setup(this.type != undefined ? this.type : b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
    },
    setBitMapHelper: function (x, y, w, h) {
        this.canvas = VK.Canvas.renderToCanvas(this.getWidth(), this.getHeight(), function (ctx, option) {
            ctx.drawImage(option.me.image, x, y, w, h, 0, 0, option.me.w, option.me.h);
        }, null, { me: this });
    }
});
//////////////////////////////// END BASE //////////////////////////////

////////////////////// brick blocks ///////////////////////////

VK.InGame.BrickRoundBlock = VK.Block.RoundBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.BRICK_ROUND,
    setBitMap: function (i) {
        var x, y;
        switch (i) {
            case 0:
                x = 251;
                y = 246;
                break;
            case 1:
                x = 251;
                y = 321;
                break;
            case 2:
                x = 251;
                y = 396;
                break;
            case 3:
                x = 251;
                y = 471;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, y, 74, 74);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.BRICK_ROUND, VK.InGame.BrickRoundBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////

VK.InGame.BrickLongBlock = VK.Block.BaseBlock.extend({
    name: VK.CONSTANT.BLOCKS.BRICK_LONG,
    init: function (options) {
        this._super(options);
        this.setup(this.type != undefined ? this.type : b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
    },
    setBitMap: function (i) {
        var top = null;
        switch (i) {
            case 0:
                top = 529;
                break;
            case 1:
                top = 551;
                break;
            case 2:
                top = 573;
                break;
            case 3:
                top = 595;
                break;
        }
        if (top) {
            this.canvas = VK.Canvas.renderToCanvas(this.getWidth(), this.getHeight(), function (ctx, option) {
                ctx.drawImage(option.me.image, 413, top, 207, 21, 0, 0, option.me.w, option.me.h);
            }, null, { me: this });
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.BRICK_LONG, VK.InGame.BrickLongBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////
VK.InGame.BrickCubeBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BRICK_CUBE,
    setBitMap: function (i) {
        var y = null;
        switch (i) {
            case 0:
                y = 85;
                break;
            case 1:
                y = 169;
                break;
            case 2:
                y = 253;
                break;
            case 3:
                y = 337;
                break;
        }
        if (y) {
            this.setBitMapHelper(85, y, 83, 83);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.BRICK_CUBE, VK.InGame.BrickCubeBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });
/////////////////////////////////////////////////////////////////////////

VK.InGame.BrickMidBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.BRICK_MID,
    setBitMap: function (i) {
        var x, y, w = 83, h = 41;
        switch (i) {
            case 0:
                x = 584;
                y = 289;
                break;
            case 1:
                x = 669;
                y = 289;
                break;
            case 2:
                x = 329;
                y = 332;
                break;
            case 3:
                x = 329;
                y = 375;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, y, w, h);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.BRICK_MID, VK.InGame.BrickMidBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////

// ///////////////// brown wood block ////////////////////////
VK.InGame.WoodRoundBlock = VK.Block.RoundBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.WOOD_ROUND,
    setBitMap: function (i) {
        var x, y;
        switch (i) {
            case 0:
                x = 170;
                y = 662;
                break;
            case 1:
                x = 252;
                y = 170;
                break;
            case 2:
                x = 329;
                y = 170;
                break;
            case 3:
                x = 406;
                y = 170;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, y, 74, 74);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.WOOD_ROUND, VK.InGame.WoodRoundBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////
VK.Block.WoodLongBlockBase = VK.Block.BaseBlock.extend({
    setBitMap: function (i) {
        var top = null;
        switch (i) {
            case 0:
                top = 440;
                break;
            case 1:
                top = 462;
                break;
            case 2:
                top = 485;
                break;
            case 3:
                top = 505;
                break;
        }
        if (top) {
            this.canvas = VK.Canvas.renderToCanvas(this.getWidth(), this.getHeight(), function (ctx, option) {
                ctx.drawImage(option.me.image, 413, top, 207, 21, 0, 0, option.me.w, option.me.h);
            }, null, { me: this });
        }
    }
});
VK.InGame.WoodLongBlock = VK.Block.WoodLongBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.WOOD_LONG,
    init: function (options) {
        this._super(options);
        this.setup(b2Body.b2_dynamicBody, { Name: this.name, Entity: this });
        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.WOOD_LONG, VK.InGame.WoodLongBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////


VK.InGame.WoodLongBlockAngle = VK.Block.WoodLongBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.WOOD_LONG_ANGLE,
    init: function (options) {
        this._super(options);
        this.angle = this.angle || 0;
        //this.angle = angle || 0; // degree
        this.b2Body = VK.Box2dUtils.generateBox(this.b2World, this.getWidth() / 2, this.getHeight() / 2, this.x, this.y, b2Body.b2_staticBody, this.angle);
        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y, angle: this.angle * VK.Box2dUtils.DEGREE_TO_RADIAN });
    },
    update: function (timeDelta) { }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.WOOD_LONG_ANGLE, VK.InGame.WoodLongBlockAngle, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////



VK.InGame.WoodCubeBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.BROWN_CUBE,
    setBitMap: function (i) {
        var x = null;
        switch (i) {
            case 0:
                x = 85;
                break;
            case 1:
                x = 169;
                break;
            case 2:
                x = 253;
                break;
            case 3:
                x = 337;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, 1, 83, 83);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.BROWN_CUBE, VK.InGame.WoodCubeBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////


VK.InGame.WoodMidBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.BROWN_MID,
    setBitMap: function (i) {
        var x, y, w = 84, h = 42;
        switch (i) {
            case 0:
                x = 669;
                y = 245;
                break;
            case 1:
                x = 329;
                y = 289;
                break;
            case 2:
                x = 414;
                y = 289;
                break;
            case 3:
                x = 499;
                y = 289;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, y, w, h);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.BROWN_MID, VK.InGame.WoodMidBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////


// ///////////////// END brown wood block ////////////////////////

////////////////////////// GLASS BLOCKS ///////////////////////////

VK.InGame.GlassRoundBlock = VK.Block.RoundBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.GLASS_ROUND,
    setBitMap: function (i) {
        var x, y;
        switch (i) {
            case 0:
                x = 634;
                y = 170;
                break;
            case 1:
                x = 709;
                y = 170;
                break;
            case 2:
                x = 483;
                y = 170;
                break;
            case 3:
                x = 559;
                y = 170;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, y, 74, 74);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.GLASS_ROUND, VK.InGame.GlassRoundBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////

VK.InGame.GlassLongBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.GlASS_LONG,
    setBitMap: function (i) {
        var x, y;
        switch (i) {
            case 0:
                x = 500;
                y = 332;
                break;
            case 1:
                x = 414
                y = 375;
                break;
            case 2:
                x = 414
                y = 396;
                break;
            case 3:
                x = 414
                y = 418;
                break;
        }
        if (y) {
            this.setBitMapHelper(x, y, 205, 20);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.GlASS_LONG, VK.InGame.GlassLongBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////

VK.InGame.GlassCubeBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.GlASS_CUBE,
    setBitMap: function (i) {
        var y = null;
        switch (i) {
            case 0:
                y = 1;
                break;
            case 1:
                y = 85;
                break;
            case 2:
                y = 168;
                break;
            case 3:
                y = 252;
                break;
        }
        if (y) {
            this.setBitMapHelper(1, y, 83, 83);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.GlASS_CUBE, VK.InGame.GlassCubeBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////

VK.InGame.GlassMidBlock = VK.Block.CubeBlockBase.extend({
    name: VK.CONSTANT.BLOCKS.GlASS_MID,
    setBitMap: function (i) {
        var x = null;
        switch (i) {
            case 0:
                x = 329;
                break;
            case 1:
                x = 413;
                break;
            case 2:
                x = 498;
                break;
            case 3:
                x = 583;
                break;
        }
        if (x) {
            this.setBitMapHelper(x, 245, 84, 42);
        }
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.GlASS_MID, VK.InGame.GlassMidBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////

VK.InGame.GlassTriangleBlock = VK.Block.BaseBlock.extend({
    name: VK.CONSTANT.BLOCKS.GLASS_TRIANGLE,
    init: function (options) {
        this._super(options);
        // TODO: Replace with my own art resources
        this.image = jaws.assets.get("assets/blocks/glass-triangle.png");
        this.canvas = VK.Canvas.renderToCanvas(84, 84, function (ctx, option) {
            ctx.drawImage(option.me.image, 0, 0, 84, 84, 0, 0, options.h, options.w);
        }, null, { me: this });


        // window.open(this.canvas.toDataURL())

        this.sprite = new jaws.Sprite({ image: this.canvas, x: this.x, y: this.y });
        //create simple triangle
        if (!this.isDesignMode) {
            var fixDef = VK.Box2dUtils.generateB2FixtureDef(0.5, 10, 0.1);
            fixDef.shape = new b2PolygonShape();

            var bodyDef = VK.Box2dUtils.generateB2BodyDef(b2Body.b2_dynamicBody, this.x, this.y, { Name: this.name, Entity: this });

            fixDef.shape.SetAsArray([
		      new b2Vec2(41 / VK.Box2D.WORLD_SCALE, 85 / VK.Box2D.WORLD_SCALE),
		      new b2Vec2(0 / VK.Box2D.WORLD_SCALE, 2 / VK.Box2D.WORLD_SCALE),
		      new b2Vec2(85 / VK.Box2D.WORLD_SCALE, 2 / VK.Box2D.WORLD_SCALE)
	        ]);

            this.b2Body = this.b2World.CreateBody(bodyDef)
            this.b2Body.CreateFixture(fixDef);
        }
    },
    draw: function (ctx, timeDelta, hitTest) {

        var context = ctx;
        var sprite = this.sprite;
        context.save()
        context.translate(sprite.x, sprite.y);

        if (this.sprite.angle != 0) {
            context.rotate(this.sprite.angle);
        }
        context.globalAlpha = sprite.alpha;
        context.translate(-sprite.left_offset, -sprite.top_offset);
        context.drawImage(sprite.image, 0, 0);
        context.restore();
    }
});
VK.GameHelper.setXtype(VK.CONSTANT.BLOCKS.GLASS_TRIANGLE, VK.InGame.GlassTriangleBlock, { scope: VK.CONSTANT.ENTITY_SCOPE.DEPRECATED });
/////////////////////////////////////////////////////////////////////////
////////////////////////// END GLASS BLOCKS ///////////////////////////