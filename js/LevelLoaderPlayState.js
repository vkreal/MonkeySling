VK.LevelLoaderPlayState = VK.EntityPlayStateBase.extend({
    debug: false,

    loadGame: function () {
        this._super();
        VK.GameHelper.hideAd();

        /////////////////////////// CAAT TEST CODE ///////////////////////
        //////////////////////////////////////////////////////////////////

        var me = this;

        var FallingStarsActorContainer;
        function __scene(director) {

            var scene = director.createScene();

            var bg = new CAAT.ActorContainer().
            setBounds(0, 0, director.width, director.height)
            //setFillStyle('#222');

            scene.addChild(bg);

            // create a sprite image of 1 row by 6 columns
            var starsImage = new CAAT.SpriteImage().
            initialize(director.getImage('stars'), 1, 6);

            var T = 2500;

            //var mouseStars = function (mouseEvent) {
            //    var actorStar = new VK.CAAT.StarActor().initialize(director, scene, { x: mouseEvent.point.x, y: mouseEvent.point.y });
            //    // add the actor.
            //    bg.addChild(actorStar);
            //};

            // set background's mouse handlers.
            //                bg.mouseMove = mouseStars;
            //                bg.mouseDrag = mouseStars;
            me.ActorContainer = bg;
            me.director = director;
            me.directorScene = scene;
            //me.mouseStars = mouseStars;


            FallingStarsActorContainer = new VK.CAAT.ParticleStarContainerActor().initialize(me.director, me.directorScene, { x: 0, y: 0, w: me.WORLD_WIDTH, h: me.WORLD_HEIGHT });


            // add the actor.
            me.directorScene.addChild(FallingStarsActorContainer);


            me.centerAroundPlayer();
        };

        if (!this.CAAT_Init) {
            new CAAT.ImagePreloader().loadImages(
            VK.CAAT.Resources,
            function (counter, images) {
                if (counter == images.length) {
                    me.director.setImagesCache(images);
                    __scene(me.director);
                }
            });

            this.CAAT_Init = true;

        }

        // hidrate game entities
        this.hydrate(this.levelDef.worldDef, false);


        if (VK.Howto.isFirstTimePlay()) {
            me.pause();
            VK.Howto.showHowtoPlay(function () {
                me.unpause();
            });
        }
    },
    init: function (options) {
        if (options.levelDef && options.levelDef.worldDef && options.levelDef.worldDef[VK.CONSTANT.DESIGN_LEVEL_DEF.THEME]) {
            this.setTheme(options.levelDef.worldDef[VK.CONSTANT.DESIGN_LEVEL_DEF.THEME]);
        }
        if (options.levelDef && options.levelDef.worldDef && options.levelDef.worldDef[VK.CONSTANT.DESIGN_LEVEL_DEF.UNLIMITED_LIFE]) {
            this.setUnlimitedLife(true);
        }
        this._super(options);
    },
    setup: function () {
        var DESIGN_LEVEL_DEF = VK.CONSTANT.DESIGN_LEVEL_DEF;
        var w = DESIGN_LEVEL_DEF.WORLD_WIDTH;
        var h = DESIGN_LEVEL_DEF.WORLD_HEIGHT;
        var e = DESIGN_LEVEL_DEF.ENTITIES;

        // set world w/h

        var ww = this.levelDef.worldDef[w];
        if (VK.isWinJS() && ww < screen.width) {
            ww = screen.width;
        }
        this.setWorldWidth(ww);

        var wh = this.levelDef.worldDef[h];

        //if (wh < 1080) {
        //    wh = 1080;
        //}
        
        this.setWorldHeight(wh);
        this._super();
        //this.background = new jaws.Sprite({ image: document.getElementById('bg_test') });
        this.loadGame();
    }
});

//view-source:http://jawsjs.com/jawsjs/examples/example9.html

//jaws.onload = function () {
//    var w = window.document.documentElement.clientWidth;
//    var h = window.document.documentElement.clientHeight;

//    var canvas = document.getElementById('canvas');
//    var container = document.getElementById('container');

//    if (VK.isWinJS()) {

//        PubSub.publish("/viewState/get/", function (viewStates) {
//            w = viewStates['availableWidth']
//            canvas.width = w;
//            container.style.width = w + 'px';
//        });
        
//        canvas.height = h;
//        container.style.height = h + 'px';

//    }
//    else {
//        canvas.width = 1024;
//        container.style.width = '1024px';

//        canvas.height = 768;
//        container.style.height = '768px';
//    }
//    //else {
//    //    canvas.width = 760;
//    //    container.style.width = '760px';

//    //    canvas.height = 600;
//    //    container.style.height = '600px';
//    //}

//    jaws.unpack();
    
//    jaws.assets.root = VK.APPLICATION_ROOT;

//    jaws.assets.add(VK.Resources.URL_MAP);
//    //var t = new VK.PlayMonkeySling(); //PlayMonkeySling

//    var menu = new VK.IntroBase();

//    if (VK.GameHelper.getUrlParameterByName('dt') == 'y') {
//        jaws.start(VK.TestDesigner, { fps: 60 });
//    }
//    else {
//        jaws.start(menu, { fps: 60 });  // Our convenience function jaws.start() will load assets, call setup and loop update/draw in 60 FPS
//    }
//};