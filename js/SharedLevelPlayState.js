
VK.SharedLevelPlayState = VK.EntityPlayStateBase.extend({
    _isDesignMode: false,
    active: true,
    // shared levels life are unlimited
    //isUnlimitedLife: function () { return true;},
    init: function (options) {
        var levelDef = options.levelDef;

        if (levelDef && levelDef[VK.CONSTANT.DESIGN_LEVEL_DEF.THEME]) {
            this.setTheme(levelDef[VK.CONSTANT.DESIGN_LEVEL_DEF.THEME]);
        }
        this._super(options);

        var DESIGN_LEVEL_DEF = VK.CONSTANT.DESIGN_LEVEL_DEF;
        var canvas_dim = VK.DOM.getCanvasSize();

        this.WORLD_WIDTH = canvas_dim.w;
        this.WORLD_HEIGHT = canvas_dim.h;

        if (levelDef) {
            var w = levelDef[DESIGN_LEVEL_DEF.WORLD_WIDTH];
            var h = levelDef[DESIGN_LEVEL_DEF.WORLD_HEIGHT];

            if (w && w > canvas_dim.w) {
                this.WORLD_WIDTH = w;
            }
            if (h && h > canvas_dim.h) {
                this.WORLD_HEIGHT = h;
            }
        }
    },
    //showPauseButton: function() {},
    loadGame: function (callback) {
        this._super();
        PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_LEVEL_BACKGROUND_SOUND, { play: true });
        this.hydrate(this.levelDef, false);
      
        var me = this;

        function __scene(director) {
            me.directorScene = director.createScene();

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
        if (callback) {
            callback();
        }

        if (VK.Howto.isFirstTimePlay()) {
            me.pause();
            VK.Howto.showHowtoPlay(function () {
                me.unpause();
            });
        }
    },
    setup: function () {
        this._super();
        this.loadGame();
    }
});

