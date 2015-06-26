/// BEGIN CAAT OVERRIDE TO PLAY NICE WITH SCROLLER

// KNOWN ISSUES
// 1. CAAT.ScaleBehavior() set setValueApplication(false) to make scroller work correctly
CAAT.SpriteImage.prototype.paintN = function (director, time, x, y) {
    this.setSpriteIndexAtTime(time);
    var el = this.mapInfo[this.spriteIndex];
    var me = this;
    if (VK.GameHelper.getCurrent()) {
        VK.GameHelper.getCurrent().Viewport.apply(function () {
            director.ctx.drawImage(
            me.image,
            el.x, el.y,
            el.width, el.height,
            (me.offsetX + x) >> 0, (me.offsetY + y) >> 0,
            el.width, el.height);

        }, VK.GameHelper.getCurrent().zoom);
    }
    return this;
};

CAAT.Director.prototype.setBounds = function (x, y, w, h) {
    CAAT.Director.superclass.setBounds.call(this, x, y, w, h);

    this.ctx = this.canvas.getContext(this.glEnabled ? 'experimental-webgl' : '2d');
    this.crc = this.ctx;

    for (var i = 0; i < this.scenes.length; i++) {
        this.scenes[i].setBounds(0, 0, w, h);
    }

    if (this.glEnabled) {
        this.glReset();
    }

    return this;
};

// DISABLE CAAT EVENT HANDLERS /// WE DONT NEED THEM AT THIS MOMENT
CAAT.Director.prototype.createEventHandler = function () { };

/// END CAAT OVERRIDE TO PLAY NICE WITH SCROLLER


jaws.Sprite.prototype.draw = function (context) {
    if (!this.image) { return this }
    if (this.dom) { return this.updateDiv() }
    var ctx = context || this.context;
    ctx.save()
    ctx.translate(this.x, this.y)
    if (this.angle != 0) { jaws.context.rotate(this.angle * Math.PI / 180) }
    this.flipped && ctx.scale(-1, 1)
    ctx.globalAlpha = this.alpha
    ctx.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
    ctx.drawImage(this.image, 0, 0, this.width, this.height)
    ctx.restore()
    return this
};

// have to call it draw2 becuase it will override jaws.Sprite.prototype.draw
jaws.ParallaxLayer.prototype.draw2 = function (ctx, gameState) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.angle != 0) { jaws.context.rotate(this.angle * Math.PI / 180) }
    this.flipped && this.context.scale(-1, 1)
    this.context.globalAlpha = this.alpha
    this.context.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
    this.context.drawImage(this.image, 0, 0, this.width, this.height, 0, (gameState.getWorldHeight() - this.image.height - 120) * gameState.zoom, gameState.getWorldWidth() * gameState.zoom, this.height)
    this.context.restore()
    return this
};

jaws.Parallax.prototype.draw = function (ctx, gameState) {
    var layer, numx, numy, initx;

    for (var i = 0; i < this.layers.length; i++) {
        layer = this.layers[i]

        if (this.repeat_x) {
            initx = -((this.camera_x / layer.damping) % layer.width);
        } else {
            initx = -(this.camera_x / layer.damping)
        }

        if (this.repeat_y) {
            layer.y = -((this.camera_y / layer.damping) % layer.height);
        } else {
            layer.y = -(this.camera_y / layer.damping);
        }

        layer.x = initx;
        while (layer.y < jaws.height) {
            while (layer.x < jaws.width) {
                if (layer.x + layer.width >= 0 && layer.y + layer.height >= 0) { //Make sure it's on screen
                    layer.draw2(ctx, gameState); //Draw only if actually on screen, for performance reasons
                }
                layer.x = layer.x + layer.width;
                if (!this.repeat_x) {
                    break;
                }
            }
            layer.y = layer.y + layer.height;
            layer.x = initx;
            if (!this.repeat_y) {
                break;
            }
        }
    }
}