/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    if (!VK.InGame.Effect) {
        VK.InGame.Effect = {};
    };

    var _explosionAnim = null;

    var getExplosionAnimation = function (name) {
        if (_explosionAnim) {
            _explosionAnim.index = 0;
            return _explosionAnim;
        }

        _explosionAnim = new jaws.Animation({
            sprite_sheet: jaws.assets.get("assets/ingame/explosion.png"),
            frame_size: [64, 64], frame_duration: 125, orientation: 'right', cacheKey: name
        });

        return _explosionAnim;
    };

    VK.InGame.Effect.Explosion = VK.Entity.extend({
        b2World: null,
        name: 'Effect.Explosion',
        init: function (options) {
            this._super(options);
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'tnt_explosion' });
            this.anim = getExplosionAnimation(this.name);

            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
        },
        update: function (timeDelta) {
            if (this.anim.atLastFrame()) {
                this.sprite.setImage(this.anim.frames[this.anim.frames.length - 1]);
                this.createTimer(100, function () {
                    this.setActive(false);
                }.bind(this), null, null);
            }
            else {
                this.sprite.setImage(this.anim.next());
            }
        },
        draw: function (ctx, timeDelta) {
            this.sprite.draw();
        }
    });
    VK.GameHelper.setXtype('Effect.Explosion', VK.InGame.Effect.Explosion, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });




    var _BlockDestroyAnim = null;

    var getBlockDestroyAnimation = function (name) {
        if (_BlockDestroyAnim) {
            _BlockDestroyAnim.index = 0;
            return _BlockDestroyAnim;
        }

        _BlockDestroyAnim = new jaws.Animation({
            sprite_sheet: jaws.assets.get("assets/ingame/block_destroy2.png"),
            frame_size: [64, 64], frame_duration: 125, orientation: 'right', cacheKey: name
        });

        return _BlockDestroyAnim;
    };
    VK.InGame.Effect.BlockDestroy = VK.Entity.extend({
        b2World: null,
        name: 'Effect.Block.Destroy',
        init: function (options) {
            this._super(options);
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'block_destroyed' });
            this.anim = getBlockDestroyAnimation(this.name);

            this.sprite = new jaws.Sprite({ x: this.x, y: this.y });
        },
        update: function (timeDelta) {
            if (this.anim.atLastFrame()) {
                this.sprite.setImage(this.anim.frames[this.anim.frames.length - 1]);
                this.createTimer(100, function () {
                    this.setActive(false);
                }.bind(this), null, null);
            }
            else {
                this.sprite.setImage(this.anim.next());
            }
        },
        draw: function (ctx, timeDelta) {
            this.sprite.draw();
        }
    });
    VK.GameHelper.setXtype('Effect.Block.Destroy', VK.InGame.Effect.BlockDestroy, { scope: VK.CONSTANT.ENTITY_SCOPE.PRIVATE });

})();