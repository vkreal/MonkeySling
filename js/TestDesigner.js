/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    VK.DesignerPROP = {};
    VK.DesignerPROP.showDesignerPropDialog = function () {
        return false;
    };
    var designer_prop_template = [
       '<table class="fill tutorial-intro-wrapper designer-prop" style="position:absolute; top:30px; z-index:100;">',
          '<tr>',
              '<td align="center" valign="top">',
                  '<div class="tutorial-intro" style="position:relative;">',
                     '<table class="fill" border="0" cellspacing=0 cellpadding=0">',
                         '<tr>',
                             '<td align="center" valign="top" colspan="3">',
                                 '<div class="tutorial-intro-titlebar"></div>',
                             '</td>',
                         '</tr>',
                         '<tr>',
                             '<td align="center" valign="top">',
                             'World Width: <input type="text" style="width:50px;  font-size:medium; font-family:Arial;" class="tutorial-intro-width" value="2048"/>',
                             'World Height: <input type="text" style="width:50px;  font-size:medium; font-family:Arial;" class="tutorial-intro-height" value="1536"/>',
                             '</td>',
                         '</tr>',
                         '<tr>',
                             '<td>',
                                 '<div style="text-align:center;">',
                                 '<textarea style="width:500px; height:300px; font-size:small; font-family:Arial;" class="tutorial-intro-textArea"></textarea>',
                                 '<br />',

                                     '<button class="tutorial-intro-btGetJson">Get JSON</button>',
                                     '<button class="tutorial-intro-btClear">Clear</button>',
                                     '<label style="font-size:small; font-family:Arial;">include screen: </label>  <input type="checkbox" class="tutorial-intro-screen"/>',
                                     '<label style="font-size:small; font-family:Arial;">revers gravity: </label>  <input type="checkbox" class="tutorial-intro-reverse-gravity"/>',
                                 '</div>',
                             '</td>',
                         '</tr>',
                     '</table>',
                     '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/close_button.png" style="position:absolute; right:0px; bottom:-50px;" class="tutorial-intro-close"/>',
                 '</div>',
              '</td>',
          '</tr>',
      '</table>'
    ];

    VK.DesignerPROP._prop = null;

    VK.DesignerPROP._showProp = function (template) {
        VK.DesignerPROP._prop = {};
        var wrapper = VK.DOM.createDiv(null, "fill", VK.DOM.getContainer());
        VK.DesignerPROP._prop.wrapper = wrapper;
        var shadow = VK.DOM.createDiv(null, "ingame-shadow fill", wrapper);

        shadow.style.position = 'absolute';
        shadow.style.top = '0px'

        var el = VK.DOM.createDiv(null, "fill", wrapper);

        VK.DOM.setInnerHTML(el, template);

        //
        VK.DesignerPROP._prop.textArea = el.getElementsByClassName('tutorial-intro-textArea')[0];
        VK.DesignerPROP._prop.inputW = el.getElementsByClassName('tutorial-intro-width')[0];
        VK.DesignerPROP._prop.inputH = el.getElementsByClassName('tutorial-intro-height')[0];
        VK.DesignerPROP._prop.inputChk = el.getElementsByClassName('tutorial-intro-screen')[0];
        
        // HACKS NEED TO MAKE PROPER PROPERTY DIALOG BOX
        VK.DesignerPROP._prop.gravityChk = el.getElementsByClassName('tutorial-intro-reverse-gravity')[0];
        

        VK.DesignerPROP._prop.btnGetJson = el.getElementsByClassName('tutorial-intro-btGetJson')[0];
        var btnJsonEvt = VK.DOM.Event.onPointerDown(VK.DesignerPROP._prop.btnGetJson, function (e) {
            if (VK.DesignerPROP._prop.gameState) {
                var checked = VK.DesignerPROP._prop.inputChk.checked;
                var data = VK.DesignerPROP._prop.gameState.getLevelDefJson(checked, false);
                //data[VK.CONSTANT.DESIGN_LEVEL_DEF.ID] = '';
                VK.DesignerPROP._prop.textArea.value = JSON.stringify(data);
            }
        });

        VK.DesignerPROP._prop.btnClear = el.getElementsByClassName('tutorial-intro-btClear')[0];
        var btClearEvt = VK.DOM.Event.onPointerDown(VK.DesignerPROP._prop.btnClear, function (e) {
            VK.DesignerPROP._prop.textArea.value = '';
            VK.DesignerPROP._prop.inputW.value = '';
            VK.DesignerPROP._prop.inputH.value = '';
        });

        // close button
        var btn2 = el.getElementsByClassName('tutorial-intro-close')[0];
        var closeEvt = VK.DOM.Event.onPointerDown(btn2, function (e) {
            wrapper.style.display = 'none';
        });
    };

    VK.DesignerPROP.showDesignerProp = function (options) {
        if (!VK.DesignerPROP.propEl) {
            VK.DesignerPROP._showProp(designer_prop_template.join(''), function () { });
        }
        VK.DesignerPROP._prop.wrapper.style.display = '';
        if (options) {
            VK.DesignerPROP._prop.gameState = options.gameState;
        }
    };

})();

VK.TestDesigner = VK.EntityPlayStateBase.extend({
    debug: false,
    _isDesignMode: true,
    active: true,
    _isNew: false,
    init: function (options) {
        this._super(options);
        this.hideAd();
        var levelDef = this.getMyLevelById();
        if (levelDef) {
            if (levelDef[VK.CONSTANT.DESIGN_LEVEL_DEF.THEME]) {
                this.setTheme(levelDef[VK.CONSTANT.DESIGN_LEVEL_DEF.THEME]);
            }
        }

        var world_width = this.getParameterByName('w');
        var world_height = this.getParameterByName('h');

        var cDem = VK.DOM.getCanvasSize();

        this.WORLD_WIDTH = cDem.w > 2048 ? cDem.w : 2048;
        this.WORLD_HEIGHT = cDem.h;
        if (!levelDef) {
            //this.WORLD_HEIGHT = cDem.h > 1536 ? cDem.h : 1536;
        }
        if (VK.DesignerPROP._prop) {
            // set by designer dialog popup
            if (VK.DesignerPROP._prop.inputW.value) {
                this.WORLD_WIDTH = parseInt(VK.DesignerPROP._prop.inputW.value);
            }
            if (VK.DesignerPROP._prop.inputH.value) {
                this.WORLD_HEIGHT = parseInt(VK.DesignerPROP._prop.inputH.value);
            }
            if (!this.levelId && VK.DesignerPROP._prop.textArea.value !== '') {
                this.__levelDef = JSON.parse(VK.DesignerPROP._prop.textArea.value);
                this.levelId = this.__levelDef['id'];
            }
        }

        if (world_width && world_height) {
            this.WORLD_WIDTH = world_width;
            this.WORLD_HEIGHT = world_height;
        }
        

        //this.WORLD_WIDTH = 2048;
        //this.WORLD_HEIGHT = 1536;

    },
    hideToolbox: function () {
        this.toolbox.hide(true);
    },
    hide: function () {
        //$(this.container).fadeOut('slow');
        this.hideToolbox();
        this.hideDOMBackButton();
        if (this.m_BtnsRightWrapper) {
            this.m_BtnsRightWrapper.style.display = 'none';
        }
        this.active = false;
    },
    createScreenShot: function () {
        // 512x512 use for category set icon
        if (VK.DesignerPROP.showDesignerPropDialog()) {
            this.m_screenshot = this.toDataURL(400, 300);
        }
        else {
            this.m_screenshot = this.toDataURL(128, 128);
        }
        return this.m_screenshot;
    },
    //    checkLevelCompleteRULE: function () {
    //        // OVERRIDE THIS METHOD TO CHANGE LEVEL COMPLETE

    //        /// RULES HERE:
    //        /// 1. if enemies are available game wouldnt be complete until all killed
    //        /// 2. if no enemies in level, than all stars taken will be considered level complete!
    //        /// 3. LEVEL DESINGER WILL HAVE RULE 2, GET ALL THE STARS TO COMPLETE LEVEL ???????
    //        if (this.isDesignModeRunning() && (
    //        // 2.
    //                this.getStarsTotal() && this.getStarsTotal() == this.stars.length)
    //            ) {
    //            return true;
    //        }
    //        return false;
    //    },
    setSharedId: function (json, sharedId) {
        if (sharedId) {
            var i2 = VK.CONSTANT.DESIGN_LEVEL_DEF.SHARED_ID;
            json[i2] = sharedId;
            this.sharedId = sharedId;
        }
    },
    setCanShare:function(v) {
        this.canshare = v;
        if (this.m_ShareButton) {
            if (v === true) {
                this.m_ShareButton.style.opacity = 1;
            }
            else {
                this.m_ShareButton.style.opacity = 0.3;
            }
        }
    },
    getCanShare: function () {
        return this.canshare;
    },
    getLevelDefJson: function (createscreen) {
        // s: screenshot
        // w: world width
        // h: world height
        // e: entities definitions

        var DESIGN_LEVEL_DEF = VK.CONSTANT.DESIGN_LEVEL_DEF;

        var cs = DESIGN_LEVEL_DEF.CANSHARE;
        var s = DESIGN_LEVEL_DEF.SCREENSHOT;
        var w = DESIGN_LEVEL_DEF.WORLD_WIDTH;
        var h = DESIGN_LEVEL_DEF.WORLD_HEIGHT;
        var e = DESIGN_LEVEL_DEF.ENTITIES;
        var i = DESIGN_LEVEL_DEF.ID;
        var theme = DESIGN_LEVEL_DEF.THEME;

        var ret = {};
        if (this.sharedId) {
            this.setSharedId(ret, this.sharedId);
        }
        if (createscreen !== false) {
            ret[s] = this.m_screenshot || this.createScreenShot();
        }
        ret[w] = this.WORLD_WIDTH;
        ret[h] = this.WORLD_HEIGHT;
        ret[e] = this.getEntitiesDefJson();
        ret[theme] = this.getTheme().id;
        ret[cs] = this.canshare ? true : false;

        if (!this.levelId) {
            // give new level id
            this.levelId = 'mylevel-' + (new Date()).getTime(); // +'-' + Math.random();
            this._isNew = true;
        }
        ret[i] = this.levelId;
        return ret
    },
    show: function () {
        //this.container.style.display = '';
        this.showToolbox();
        //this.showDOMBackButton();
    },
    shareLevel: function () {
        if (this.designEntities && this.designEntities.length) {
            if (!this.sharedId) {
                VK.DOM.Wait.show('Sharing...');
            }
            var levelJson = this.getLevelDefJson();
            PubSub.publish(VK.CONSTANT.PUBSUB.SHARE, {
                'callback': function (sharedId) {
                    VK.DOM.Wait.hide();
                    if (sharedId) {
                        this.setSharedId(levelJson, sharedId);
                    }
                    // save to local storage
                    VK.GameHelper.savMyLevel(levelJson, this.levelId);
                }.bind(this),
                'levelJson': levelJson,
                'sharedId': this.sharedId
            });
        }
    },
    
    saveMyLevel: function () {
        if (this.designEntities && this.designEntities.length || this.levelId) {
            VK.GameHelper.savMyLevel(this.getLevelDefJson(), this.levelId, function () {
                VK.DOM.Wait.hide();
            });
        }
        else {
            VK.DOM.Wait.hide();
        }
    },
    before_callback_back: function () {
        this.saveMyLevel();
        return true;
    },
    showToolbox: function () {
        this.toolbox.show();
    },
    getMyLevelById: function () {
        if (this.levelId && !this.__levelDef) {
            this.__levelDef = VK.GameHelper.getMyLevelById(this.levelId);
        }
        return this.__levelDef;
    },
    loadGame: function (callback) {
        this._super();

        if (this.levelId) {
            var levelDef = this.getMyLevelById();
            if (levelDef) {
                this.hydrate(levelDef, true);
            }
        }

        var me = this;

        function __scene(director) {
            me.toolbox = VK.Toolbox.getToolbox(me);//new VK.Toolbox({ designer: me });
            me.toolbox.show();
            me.directorScene = director.createScene();
            //            me.addEntity(new VK.InGame.SpinningStarGold({ b2World: me.b2World, x: 250, y: me.WORLD_HEIGHT - 500, isStar: true, isDesignMode: true, IDXXX: 'CrateSTAR' }));
            //            me.addEntity(new VK.InGame.SpinningCoinGold({ b2World: me.b2World, x: 250, y: me.WORLD_HEIGHT - 550, isStar: true, isDesignMode: true, IDXXX: 'SpinningStarGold' }));
            ////            me.TARGET_TEST2 = new VK.InGame.WoodCubeBlock({ b2World: me.b2World, x: 300, y: me.WORLD_HEIGHT - 320, w: 50, h: 83, breakable: true, isDesignMode: true, IDXXX: 'WoodCubeBlock2' })
            ////            me.addEntity(me.TARGET_TEST2);
            //            me.addEntity(new VK.InGame.FruitBonus({ b2World: me.b2World, x: 300, y: me.WORLD_HEIGHT - 400, isDesignMode: true, IDXXX: 'FruitBonusXXX' }));
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

        if (!me.levelId && VK.Howto.isFirstTimeCreate()) {
            VK.Howto.showHowtoCreate(function () {
            });
        }

        this.centerAround({ x: 0, y: this.Viewport.max_y });
    },
    playLevel2: function (force) {
        VK.DOM.Wait.show('Running...');
        this.m_RunStopButton.setAttribute('clicked', '1');
        this.createScreenShot();
        var delay = function () {
            this.hideDOMBackButton(true);
            this.playLevel(function () {
                // done loading
                // hide splash loading screen
                this.m_RunStopButton.className = "ingame-btn-stop";
                this.m_RunStopButton.removeAttribute('clicked');
                this.m_RunStopButton.title = 'pause';
                VK.DOM.Wait.hide();

            }.bind(this), force);
        }.bind(this);

        delay.defer();
    },
    restartGame: function () {
        this.unpause();
        this.playLevel2(true);
    },
    designLevel2: function () {
        VK.DOM.Wait.show();
        this.m_RunStopButton.setAttribute('clicked', '1');
        var delay = function () {
            this.showDOMBackButton();
            this.designLevel(function () {
                this.m_RunStopButton.className = "ingame-btn-play";
                this.m_RunStopButton.title = 'run';
                this.m_RunStopButton.removeAttribute('clicked');
                VK.DOM.Wait.hide();
            }.bind(this));
        }.bind(this);

        delay.defer();
    },
    showRunStopButton: function (which) {
        var playClass = "ingame-btn-play";
        var stopClass = "ingame-btn-stop";
        if (!this.m_BtnsRightWrapper) {
            var container = VK.DOM.getContainer();

          
            this.m_BtnsRightWrapper = VK.DOM.createDiv(null, "float-right", VK.DOM.getContainer());
            //this.m_BtnsRightWrapper.style.border = '1px solid red;'


            if (VK.DesignerPROP.showDesignerPropDialog()) {
                this.m_LevelPropButton = VK.DOM.createDiv(null, "ingame-btn-main", this.m_BtnsRightWrapper);
                this.m_LevelPropButton.style.display = 'inline-block';
                this.m_LevelPropButton.style.marginRight = '10px';
                VK.DOM.Event.onPointerDown(this.m_LevelPropButton, function (e) {
                    VK.DesignerPROP.showDesignerProp({ gameState: this });
                }.bind(this));
            }
            
            this.m_RunStopButton = VK.DOM.createDiv(null, "", this.m_BtnsRightWrapper);
            this.m_RunStopButton.style.display = 'inline-block';
            this.m_RunStopButton.style.marginRight = '10px';
            this.m_RunStopButton.title = 'run';

            // only allow share for WIN* for NOW
            if (VK.isWinJS()) {
                this.m_ShareButton = VK.DOM.createDiv(null, "ingame-btn-share", this.m_BtnsRightWrapper);
                this.m_ShareButton.style.display = 'inline-block';
                this.m_ShareButton.title = 'share this level';

                VK.DOM.Event.onPointerDown(this.m_ShareButton, function (e) {
                    if (this.getCanShare()) {
                        this.shareLevel();
                    }
                }.bind(this));
            }
            VK.DOM.Event.onPointerDown(this.m_RunStopButton, function (e) {
                // fixed issue with fast clickers!
                if (this.m_RunStopButton.getAttribute('clicked')) {
                    return;
                }
                if (this.m_RunStopButton.className == playClass) {
                    // take screenshot before play
                    this.createScreenShot();
                    this.hideDOMBackButton(true);
                    this.playLevel2();
                }
                else {
                    this.designLevel2();
                }    
            } .bind(this));
        }
        if (which == 'stop') {
            this.m_RunStopButton.className = stopClass;
        }
        else {
            this.m_RunStopButton.className = playClass;
        }
        this.m_BtnsRightWrapper.style.display = '';
        this.showDOMBackButton();
    },
    setup: function () {
        var levelDef = this.getMyLevelById();
        if (levelDef) {
            var DESIGN_LEVEL_DEF = VK.CONSTANT.DESIGN_LEVEL_DEF;
            var w = DESIGN_LEVEL_DEF.WORLD_WIDTH;
            var h = DESIGN_LEVEL_DEF.WORLD_HEIGHT;
            // set world w/h
            this.setWorldWidth(levelDef[w]);
            this.setWorldHeight(levelDef[h]);

            // set shared id persisted on db
            if (levelDef[DESIGN_LEVEL_DEF.SHARED_ID]) {
                this.sharedId = levelDef[DESIGN_LEVEL_DEF.SHARED_ID];
            }
        }
        this._super();
        this.background = new jaws.Sprite({ image: document.getElementById('canvas2') });
        this.loadGame();

        // show pause div button
        if (this.isDesigning()) {
            this.showRunStopButton();

            var cs = VK.CONSTANT.DESIGN_LEVEL_DEF.CANSHARE
            if (levelDef) {
                var canShare = levelDef[cs] === true;
                this.setCanShare(canShare);
            }
            else {
                this.setCanShare(false);
            }
        }
    },

    ///////////////////////////////// BEGIN LEVEL CREATOR METHODS ///////////////////////////
    onAfterDesignerRemoveEntity: function (entityName) {
        this.removeInstanceTrackerCount(entityName);
        this.toolbox.resolveAvailableEntities(this);
    },
    onTouchStartToolbox: function (e, xtypeInfo) {
        // HACK TO GET REVERS GRAVITY SET, NEED TO MOVE TO PROPER DIALOG BOX OF PROPERTIES FOR OBJECT
        var reverseGravity = false;
        if (VK.DesignerPROP._prop && VK.DesignerPROP._prop.gravityChk.checked) {
            reverseGravity = true;
        }
        var coord = this.calcPointerXYPixel(e);
        var xx = new xtypeInfo.clazz({ b2World: this.b2World, x: coord.x, y: coord.y, isDesignMode: true });
        if (reverseGravity) {
            xx.setReversGravity(true);
        }
        // add to tracker
        this.addInstanceTrackerCount(xx.name, xtypeInfo);
        this.toolbox.resolveAvailableEntities(this);

        this.addEntity(xx);
        // mark entity just got created
        xx.ENTITY_DESIGN_STATE = VK.CONSTANT.ENTITY_DESIGN_STATE.JUST_CREATED;
        // TODO: shouldnt have to recalc again FIXME
        this.calcPointerXY(e);
        this.setDesignerSelectEntity({
            entity: xx,
            action: VK.CONSTANT.DESIGNER.MOVE
        });
    },
    setDesignerSelectEntity: function (foundItem) {
        if (foundItem) {
            if (this.__selectedEntity && this.__selectedEntity !== foundItem.entity) {
                // deselect previous entity
                if (this.__selectedEntity.isActive()) {
                    this.__selectedEntity.setIsSelected(false);
                }
            }
            foundItem.entity.setIsSelected(true);
            // keep track of selected entity
            this.__selectedEntity = foundItem.entity;
        }
        else if (this.__selectedEntity && this.__selectedEntity.isActive()) {
            // deselect if target not acquire?????????
            this.__selectedEntity.setIsSelected(false);
            this.__selectedEntity = null;
        }
        // set selected info for level builder
        this.INPUT.isMouseDown = { x: this.INPUT.mouseX, y: this.INPUT.mouseY, designer_selected_info: foundItem };
    },
    __clearEntities: function () {
        var entities = this.entities;
        // cleanup box2d and other stuff
        if (entities && entities.length) {
            this.destroyEntities(entities);
        }
        this.entities = [];
    },
    designLevel: function (callback) {
        if (this.isDesignMode()) {
            return;
        }
        this.hideAd();
        this.clearTimers();
        // clear out entities running
        this.showToolbox();
        this.__clearEntities();
        //this.setEntities([]);

        if (this.designEntities && this.designEntities.length) {
            for (var m = 0; m < this.designEntities.length; m++) {
                // create new touch sensor body
                if (this.designEntities[m].createDesignerSensorMove) {
                    this.designEntities[m].createDesignerSensorMove();
                }
            }
        }

        this.setIsDesignMode(true, false);
        if (callback) {
            callback();
        }
    },
    playLevel: function (callback, force) {
        // 1. clone entities
        // 2. turn 
        if (this.isDesignModeRunning() && force !== true) {
            return;
        }
        //this.showAd();
        this.clearTimers();
        this.__clearEntities();
        this.resetVariablesBasic();
        //this.clearTimers();
        this.hideToolbox();
        this.starsTotal = 0;
        var level_designer_entities = this.designEntities;

        var len = level_designer_entities.length;
        var entities = [];
        for (var i = len - 1; i >= 0; i--) {
            var level_designer_entity = level_designer_entities[i];

            var states = level_designer_entity.get();
            try {
                for (var key in states) {
                    level_designer_entity.options[key] = states[key];
                }
            }
            catch (e) {
                debugger
            }
            level_designer_entity.options.isDesignMode = false;

            // remove body sensors for touch
            var b = level_designer_entity.rotateMove;
            if (b) {
                this.addBodiesScheduledForRemoval(b);
                // clear out sensor body, we can't reuse them
                //level_designer_entity.clearBody();
            }
            // remove body sensors for touch
            var b = level_designer_entity.bodyMove;
            if (b) {
                this.addBodiesScheduledForRemoval(b);
                level_designer_entity.bodyMove = null;
             }
            var b2 = level_designer_entity.bodyRotate;
            if (b2) {
                this.addBodiesScheduledForRemoval(b2);
                level_designer_entity.bodyRotate = null;
            }
            


            var xtype = level_designer_entity.getXtypeName();
            // setup entities to play
            if (!VK.GameHelper.isPrivateXtype(xtype) && !level_designer_entity.isPrivate()) {
                var clazz = VK.GameHelper.getXtypeClass(xtype);
                entities.push({ clazz: clazz, options: level_designer_entity.options });
            }
        }
        if( force !== true )
        this.setIsDesignMode(false, true);
        for (var i = 0; i < entities.length; i++) {
            var test = new entities[i].clazz(entities[i].options);
            this.addEntity(test);
        }
        if (callback) {
            callback();
        }
        this.centerAroundPlayer();
        //prompt('', JSON.stringify(this.getLevelJson()));
    },
    getEntitiesDefJson: function () {
        var entities = this.designEntities;
        var len = entities.length;
        var entitiesStates = [];
        for (var i = len - 1; i >= 0; i--) {
            var entity = entities[i];
            var xtype = entity.getXtypeName();
            if (!VK.GameHelper.isPrivateXtype(xtype) && !entity.isPrivate()) {
                var states = entity.get();
                var entityState = {};
                for (var key in states) {
                    entityState[key] = states[key];
                }
                entityState[VK.CONSTANT.ENTITY_EXTERN.XTYPE] = xtype;
                entitiesStates.push(entityState)
            }
        }
        return entitiesStates;
    }
    ///////////////////////////////// END LEVEL CREATOR METHODS ///////////////////////////
});