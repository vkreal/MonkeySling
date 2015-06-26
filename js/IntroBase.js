/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

// 1. do intro scene
// 2. show play button
// 3. show level designer button
// 4. show options button mute musice etc...
// 5. show credit scene???
VK.IntroBase = VK.GameState_SELECTION.extend({
    WORLD_WIDTH: 0,
    WORLD_HEIGHT: 0,
    entities: null,
    WALL_PADDING: 20,
    active: true,
    _alreadySetup: false,
    isActive: function () {
        return jaws.game_state == this && this.active;
    },
    show: function () {
        $('.intro-template').show();
        //this.active = true;
    },
    hide: function () {
        //$('.intro-template').fadeOut('slow');
        $('.intro-template').hide();
        //this.active = false;
    },
    destroy: function () {
//        this.removeListeners();
//        if (this.container) {
//            this.container.innerHTML = '';
//            this.container.parentNode.removeChild(this.container);
//            this.container = null;
//            // TODO: REMOVE LISTERNERS
//        }
    },
    setupB2D: function () {
        this.b2World = new b2World(
        // 0.001 to simulate wind
            new b2Vec2(0.0, 10.0)   //gravity
            , true                 //allow sleep
        );
//        var debugDraw = new b2DebugDraw();
//        // hack clear method...bug!!! in rendering
//        debugDraw.m_sprite.graphics.clear = function () { };
//        debugDraw.SetSprite(jaws.context);
//        debugDraw.SetDrawScale(VK.Box2D.WORLD_SCALE);
//        debugDraw.SetFillAlpha(0.5);
//        debugDraw.SetLineThickness(1.0);
//        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
//        this.b2World.SetDebugDraw(debugDraw);

        // NOTE: box2 create rect w/2
        VK.Box2dUtils.generateWall_TOP(this.b2World, this.WORLD_WIDTH, this.WALL_PADDING / 2, 0, 0); // ceil wall
        VK.Box2dUtils.generateWall_LEFT(this.b2World, this.WALL_PADDING / 2, this.WORLD_HEIGHT, this.WALL_PADDING / 2, this.WORLD_HEIGHT - this.WALL_PADDING / 2); // left wall
        VK.Box2dUtils.generateWall_RIGHT(this.b2World, this.WALL_PADDING / 2, this.WORLD_HEIGHT, this.WORLD_WIDTH - this.WALL_PADDING / 2, 0); // right wall

        VK.Box2dUtils.generateWall_BOTTOM(this.b2World, this.WORLD_WIDTH, this.WALL_PADDING / 2, 0, this.WORLD_HEIGHT - this.WALL_PADDING / 2); // groound wall
    },
    addEntity: function (entity) {
        this.entities.push(entity);
    },
    playSound: function () { },
    setup: function () {
        PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, { play: true });
        VK.__currentState = this;
        if (this._alreadySetup) {
            return;
        }
        this._alreadySetup = true;

        this.entities = [];
        this.setupCanvas();
        var mainContainer = VK.DOM.getContainer();
        this.WORLD_WIDTH = VK.DOM.getCanvasSize().w;
        this.WORLD_HEIGHT = VK.DOM.getCanvasSize().h;

        // BEGIN SETUP WORLD
        this.World = new jaws.Rect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.Viewport = new jaws.Viewport({ max_x: this.World.width, max_y: this.World.height });
        this._super();
        // END SETUP WORLD
        this.id = new Date().getTime();

        var buy_string = "";
        if (VK.GameHelper.isTrialLicense()) {
            //buy_string = [
            //    '<tr>',
            //        '<td align="center" valign="middle">',
            //            '<br/><img src="' + VK.APPLICATION_ROOT + 'assets/intro/buy_game_button1.png" id="buy' + this.id + '" width=200 height=40>',
            //        '</td>',
            //    '<tr>'
            //].join('');
        }

        var sb = ['<div class="intro-template ingame-container fill" style="display:none;">',
            '<table class="ingame-container fill" border="0" cellpadding="0" cellspacing="0" style="background-colorXX:red;">',
                '<tr>',
                    '<td align="center">',
                    '<img src="' + VK.APPLICATION_ROOT + 'assets/logo/' + (VK.AddSupported === true ? 'ms_logo_free.png' : 'ms_logo.png') + '"/>',
                '</td>',
            '</tr>',
            '<tr>',
                '<td align="center">',
                    '<div class="ingame-main-play-button" id="play-button' + this.id + '">',
                        '<label class="game-play-button-label"></label>',
                    '</div>',
                '</td>',
            '</tr>',
            buy_string,
            '<tr>',
                '<td align="left" style="height:30%; background-colorXX:blue;">',
                    (VK.GameHelper.isMusicEnabled() ? 
                    '<div style="margin-top: 20px;" class="ingame-btn-music-small" id="music' + this.id + '"></div>' :
                    '<div style="margin-top: 20px;" class="ingame-btn-music-small-off" id="music' + this.id + '"></div>'),
                '</td>',
            '</tr>',
        '</table>',
        '</div>'];

        this.container = VK.DOM.createDiv(null, '', mainContainer);
        VK.DOM.setInnerHTML(this.container, sb.join(''));
        
        // VERY EXPENSIVE ON IE KEEP NUMBER DOWN LOW
        for (var i = 0; i < 10; i++) {
            var pxs = new VK.ParticleCircle({ WIDTH: this.WORLD_WIDTH, HEIGHT: this.WORLD_HEIGHT });
            pxs.reset();
            this.addEntity(pxs);
        }

        this.show();

        var btnBuy = document.getElementById('buy' + this.id);

        if (btnBuy) {
            this.onPointerDown(btnBuy, function (e) {
                VK.DOM.PreventDefaultManipulationAndMouseEvent(e);
                VK.GameHelper.doTrialConversion(function () {
                    btnBuy.style.display = 'none';
                });
            }.bind(this));

            PubSub.subscribe(VK.CONSTANT.PUBSUB.TRIAL_CONVERSION_SUCCESS, this, function () {
                btnBuy.style.display = 'none';
            });
        }
        this.onPointerDown(document.getElementById('play-button' + this.id), function (e) {
            VK.DOM.PreventDefaultManipulationAndMouseEvent(e);
            this.playClick();
            this.hide();
        } .bind(this));


        this.onPointerDown(document.getElementById('music' + this.id), function (e) {
            VK.DOM.PreventDefaultManipulationAndMouseEvent(e);
            this.toggleMusicButton(e.target);
        }.bind(this));

        var me = this;
        PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_TOGGLE_MUSIC_BUTTON, this, function (options) {
            if (options.caller !== me) {
                var el = document.getElementById('music' + me.id);
                if (el) {
                    if (VK.GameHelper.isMusicEnabled()) {
                        el.className = 'ingame-btn-music-small';

                    }
                    else {
                        el.className = 'ingame-btn-music-small-off';
                    }
                }
            }
        });
        this.theme = VK.GameHelper.getThemeById('systheme1');
        this.setupTheme(this.context);
        this.addEntity(new VK.InGame.Cloud4({ x: 0, y: 100, vx: .4, world_width: this.WORLD_WIDTH }));
        this.addEntity(new VK.InGame.Cloud3({ x: 400, y: 300, vx: .6, world_width: this.WORLD_WIDTH }));
    },
    toggleMusicButton: function (el, publish) {
        if (!el) { return; }
        if (VK.GameHelper.isMusicEnabled()) {
            el.className = 'ingame-btn-music-small-off';
            VK.GameHelper.setMusicEnabled('N');
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, { isMusicEnabled: false });
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_TOGGLE_MUSIC_BUTTON, { isMusicEnabled: false, caller: this });
        }
        else {
            VK.GameHelper.setMusicEnabled('Y');
            el.className = 'ingame-btn-music-small';
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, { isMusicEnabled: true });
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_TOGGLE_MUSIC_BUTTON, { isMusicEnabled: true, caller: this });
        }
    },
    playClick: function () {
        VK.GameHelper.showAd();
        // TODO: ABSTACT THIS OUT TO GAME SPECIFIC!!!!
        //jaws.switchGameState(new VK.MonkeySlingMenu({ categorySet: VK.GameHelper.getCurrentCategorySet() }));
        // PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, { play: false });
        // check to see if sharing a level
        var sharedId = VK.GameHelper.getSharedLevelId();
        if (sharedId) {
            VK.DOM.Wait.show();

            var delay = function () {
                PubSub.publish('/share/get/', {
                    'sharedId': sharedId, 'callback': function (levelJson, response) {
                        var levelState = new VK.SharedLevelPlayState({
                            levelDef: levelJson
                        });
                        PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, { play: false });
                        VK.GameHelper.switchGameState(levelState);
                        VK.DOM.Wait.hide();
                    }.bind(this)
                });
            }.bind(this);

            delay.defer();
        }
        else if (!VK.IsSharedMode()) {
            if (!this.CategorySelection) {
                this.CategorySelection = new VK.CategorySelection(
                {
                    categories: VK.GameHelper.getAllCategories(),
                    callback_back: function () {
                        this.show();
                        VK.GameHelper.switchGameState(this);
                        VK.DOM.Wait.hide();
                    }.bind(this)
                });
            }
            jaws.switchGameState(this.CategorySelection);

            this.CategorySelection.show();
        }
    },
    render: function (left, top, zoom) {
        //render(left, top, zoom, this.content);
    },
    update: function (time) {
        if (this.active && this.b2World) {
            this.b2World.Step(VK.Box2D.TIMESTEP, VK.Box2D.VELOCITY_ITERATIONS, VK.Box2D.POSITION_ITERATIONS); //performs a time step in the box2d simulation
            this.b2World.ClearForces(); //used to clear the forces after performing the time step
            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];
                if (entity.isActive && entity.isActive()) {
                    entity.update();
                }
            }
        }
    }
    //, draw: function (ctx, timeDelta, time) {
    //    if (this.active) {
    //        jaws.clear();
    //        var me = this;
    //        ctx.fillStyle = this.gradient;
    //        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //        this.Viewport.apply(function () {

    //            var backgrounds = me.__backgrounds;

    //            if (backgrounds) {
    //                for (var m = 0; m < backgrounds.length; m++) {
    //                    backgrounds[m].draw(ctx);
    //                }
    //            }

    //            for (var i = 0; i < me.entities.length; i++) {
    //                var e = me.entities[i];
    //                if (e.fade) {
    //                    e.fade();
    //                }
    //                if (e.move) {
    //                    e.move();
    //                }
    //                e.draw(jaws.context);
    //            }
    //        });
    //        this.lerp(ctx, (time - this.nextLerpTime) % this.nextLerpTime, this.lerpTime);

    //        this.drawFps(ctx);
    //    }
    //}
});