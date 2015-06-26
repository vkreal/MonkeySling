/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    // Player
    var WORLD_SCALE = VK.Box2D.WORLD_SCALE;
    var isDebugDraw = true;
    VK.EntityPlayStateBase = VK.GameStateBase.extend({
        levelSetIndex: null, // category index in VK.GameData
        levelIndex: null,   // index level in VK.GameData
        levelCount: null,   // total level count for category
        categoryCount: null,
        isTouchAction: true,
        scrollable: true,
        timeline: 0,
        score: 0,
        highScore: 0,
        Viewport: null,
        World: null,
        scrolling: false,
        WALL_PADDING: 20,
        SelectedBody: null,
        MouseJoint: null,
        director: null,
        INPUT: {
            offsetX: 0,
            offsetY: 0,
            totalOffsetX: 0,
            totalOffsetY: 0,
            mouseX: 0,
            mouseY: 0,
            mousePVec: 0,
            isMouseDown: null
        },
        b2World: null,
        WORLD_SCALE: VK.Box2D.WORLD_SCALE,
        zoom: 1,
        getScore: function () {
            return this.score;
        },
        getStarsCount: function () {
            return this.stars != null ? this.stars.length : 0;
        },

        loadGame: function () {/* load game entities/reset any level variables */
            // clear any previous crap
            this.clearTimers();
            this.clearWorld();
            this.resetVariables();
        },
        playSound: function (soundId) {
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: soundId });
        },
        addScore: function (n) {
            this.score = this.score + n;
        },
        removeEntityFromArray: function (array, entity) {
            if (!array || !entity || array.length == 0) {
                return false;
            }
            for (var i = 0; i < array.length; i++) {
                if (entity == array[i]) {
                    array.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        removeEntity: function (entity) {
            var entities = this.getEntities();
            return this.removeEntityFromArray(entities, entity);
        },
        centerAroundPlayer: function () {
            if (this.player && this.player.sprite) {
                this.centerAroundStart(this.player.sprite);
            }
            else {
                this.createTimer(800, function () {
                    // center bottom left as starting point
                    this.centerAround({ x: 0, y: this.Viewport.max_y });
                }.bind(this), null, null);
            }
        },
        centerAroundStart: function (entity, delay) {
            //if (!entity) { return; }
            //var self = this;

            //this.createTimer(800, function () {
            //    this.centerAround(entity);
            //}.bind(this), null, null);
            this._mCenterAroundOnStart = true;
        },
        centerAround: function (entity, callback) {
            if (!this.scroller) {
                return;
            }

            var x = entity.x * this.zoom;
            var y = entity.y * this.zoom;
            x = (x - this.Viewport.width / 2);
            y = (y - this.Viewport.height / 2);

            var max = (this.Viewport.max_x * this.zoom) - this.Viewport.width
            if (x < 0) { x = 0; }
            if (x > max) { x = max; }

            var max = (this.Viewport.max_y * this.zoom) - this.Viewport.height
            if (y < 0) { y = 0; }
            if (y > max) { y = max; }

            var me = this;

            this.scroller.scrollTo(x, y, true, null, null, function () {
                //console.debug('centerAround scroll done')
                me.scrolling = false;

                if (callback) {
                    callback();
                }
            });
        },
        setupScrollerExternalCalls: function (args) {
            if (!this.isActive() || !this.scroller) { return; }
            switch (args['action']) {
                case 'zoom':
                    this.scroller.zoomBy.apply(this.scroller, args['args'].concat(true));
                    break;
                case 'scrollBy':
                    this.scroller.scrollBy.apply(this.scroller, args['args'].concat(true));
                    break;
            }
        },
        restartGame: function () {
            VK.DOM.Wait.show();
            var delay = function () {
                this.loadGame();
                // rebuild here
                // start
                jaws.game_loop.unpause();

                VK.DOM.Wait.hide();


                this.centerAroundPlayer();

            }.bind(this);

            delay.defer();
        },
        setupGameExternalCalls: function (options) {
            if (VK.GameHelper.getCurrent() == this) {
                switch (options['action']) {
                    case 'pause':
                        this.pause();
                        break;
                    case 'unpause':
                        this.unpause();
                        break;
                        //case 'restart':       
                        //    if (!this.isActive()) {       
                        //        VK.DOM.Wait.show();       
                        //        var delay = function () {       
                        //            this.loadGame();       
                        //            // rebuild here       
                        //            // start       
                        //            jaws.game_loop.unpause();       

                        //            VK.DOM.Wait.hide();       

                        //        }.bind(this);       

                        //        delay.defer();       
                        //    }       
                        //    break;       
                    case 'create/entity':
                        if (this.isActive()) {
                            this.createEnity(options['type']);
                        }
                        break;
                    case 'exportlevel':
                        this.exportlevel();
                        break;
                }
            }
        },
        // export level to json
        exportlevel: function () {
            // export enitities
            var e = [];
            var entities = this.getEntities();
            for (var i = 0; i < entities.length; i++) {

            }
        },
        pause: function () { jaws.game_loop.pause(); },
        unpause: function () { jaws.game_loop.unpause(); },
        isActive: function () {
            return jaws.game_state == this && jaws.game_loop.isPause() == false;
        },
        PreventDefaultManipulationAndMouseEvent: function (evt) {
            VK.DOM.PreventDefaultManipulationAndMouseEvent(evt);
        },
        getParameterByName: function (name) {
            return VK.GameHelper.getUrlParameterByName(name);
        },
        destroy: function () {
            this.clearWorld(true);
            this.removeListeners();
        },
        init: function (options) {
            this._super(options);
            this.b2World = VK.Box2D.getB2WORLD();
            if (!this.getWorldWidth()) {
                this.WORLD_WIDTH = VK.DOM.getCanvasSize().w;
            }
            if (!this.getWorldHeight()) {
                this.WORLD_HEIGHT = VK.DOM.getCanvasSize().h;
            }
        },
        hydrate: function (levelDef, isDesignMode) {
            if (levelDef) {
                this._instanceTracker = {};
                //this.levelDef = levelDef;
                var DESIGN_LEVEL_DEF = VK.CONSTANT.DESIGN_LEVEL_DEF;
                var e = DESIGN_LEVEL_DEF.ENTITIES;
                // load designer entities def
                var entitiesDef = levelDef[VK.CONSTANT.DESIGN_LEVEL_DEF.ENTITIES];

                var CREATED = VK.CONSTANT.ENTITY_DESIGN_STATE.CREATED;

                var object_to_create_ghost = [];


                // RESOLUTION/CANVAS IS BIGGER THAT WORLD IT WAS CREATED IN SO 
                // WE NEED TO CALC OFFSETS Y
                var offset = 0;
                if (this.levelDef && this.levelDef.worldDef) {
                    var definedWorldHeight = this.levelDef.worldDef[VK.CONSTANT.DESIGN_LEVEL_DEF.WORLD_HEIGHT];

                    if (definedWorldHeight < this.getWorldHeight()) {
                        offset = this.getWorldHeight() - definedWorldHeight;
                    }
                }

                for (var i = 0; i < entitiesDef.length; i++) {
                    var def = entitiesDef[i];

                    if (offset) {
                        def[VK.CONSTANT.ENTITY_EXTERN.Y] = def[VK.CONSTANT.ENTITY_EXTERN.Y] + offset;
                    }


                    var typeName = def[VK.CONSTANT.ENTITY_EXTERN.XTYPE];

                    var xtype = VK.GameHelper.getXtype(typeName);



                    var clazz = xtype.clazz;

                    //def[VK.CONSTANT.ENTITY_EXTERN.XTYPE] = undefined;
                    def.b2World = this.b2World;
                    def.isDesignMode = isDesignMode;
                    var newObject = new clazz(def);
                    this.addEntity(newObject);
                    
                    // TRACK ENTITIES TYPE COUNT FOR CREATOR TO ENFORCE CREATION RULE
                    this.addInstanceTrackerCount(typeName, xtype);

                    if (isDesignMode) {
                        newObject.ENTITY_DESIGN_STATE = CREATED;
                    }
                }
            }
        },
        addInstanceTrackerCount: function (typeName, xtype) {
            if (!this._instanceTracker) { this._instanceTracker = {}; }
            if (!this._instanceTracker[typeName]) {
                xtype = xtype || VK.GameHelper.getXtype(typeName);
                this._instanceTracker[typeName] = { instancesTotal: xtype.instancesTotal, count: 1 };
            }
            else {
                this._instanceTracker[typeName].count++;
            }
        },
        removeInstanceTrackerCount: function (typeName) {
            if (this._instanceTracker && this._instanceTracker[typeName]) {
                this._instanceTracker[typeName].count--;
                if (this._instanceTracker[typeName].count < 0) {
                    this._instanceTracker[typeName].count = 0;
                }
            }
        },
        getInstanceTracker: function () {
            if (!this._instanceTracker) {
                this._instanceTracker = {};
            }
            return this._instanceTracker;
        },
        createTimer: function (duration, callback_timeout, callback_tick, callback_cancel) {
            var ttask = this.directorScene.createTimer(
                this.directorScene.time,
                duration,
                callback_timeout,
                callback_tick,
                callback_cancel
            );
            if (!this.timers) {
                this.clearTimers();
            }
            this.timers.push(ttask);

            return ttask;
        },
        setupScroller: function () {
            //if (this.WORLD_WIDTH == this.canvasWidth && this.WORLD_HEIGHT == this.canvasHeight) {
            //    this.scrollable = false;
            //}
            var me = this;
            //if (this.scrollable) {
            this.scroller = new Scroller(function (left, top, zoom, last) {
                me.zoom = zoom;
                me.scrolling = true;
                if (!me.isDesignMode() && last === true && me.player) {
                    me.centerAround(me.player.sprite);
                }
            },
        {
            zooming: false,
            maxZoom: 1,
            minZoom: 0.8,
        });
            //}
            //else {
            //    this.scroller = null;
            //}
            var container = VK.DOM.getCanvas();//VK.DOM.getContainer();
            var rect = container.getBoundingClientRect();

            //if (this.scroller) {
            this.scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);
            this.scroller.setDimensions(this.canvasWidth, this.canvasHeight, this.WORLD_WIDTH, this.WORLD_HEIGHT);
            //}
        },
        resize: function (w, options) {
            this.setupCanvas();

            this.Viewport = new jaws.Viewport({ max_x: this.WORLD_WIDTH, max_y: this.WORLD_HEIGHT, width: w });

            VK.DOM.getCanvasOffset();
            this.director.width = w;
            this.setupScroller();
        },
        setup: function () {
            // static singleton to track game state
            this.setupCanvas();

            isDebugDraw = VK.isDebugMode();

            /// END CONFIG STUFF FOR TESTING
            VK.__currentState = this;
            //this.World = new jaws.Rect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
            this.Viewport = new jaws.Viewport({ max_x: this.WORLD_WIDTH, max_y: this.WORLD_HEIGHT });
            // cache offsets
            VK.DOM.getCanvasOffset();

            var me = this;
            // setup CAAT director
            this.director = new CAAT.Director().
                    initialize(this.WORLD_WIDTH, this.WORLD_HEIGHT, this.canvas).
                    setClear(false);

            // b2world events
            this._super();

            this.setupScroller();

            //TODO: REMOVE DEBUG CODE
            PubSub.subscribe(VK.CONSTANT.PUBSUB.SCROLLER_ACTION, this, this.setupScrollerExternalCalls.bind(this));
            PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_ACTION, this, this.setupGameExternalCalls.bind(this));

            // MOUSE EVENTS
            container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", function (e) {
                if (!me.scroller) { return; }
                me.scroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY, function () {
                    // start following player after zoom complete?????
                });
            }, false);


            this.addListener(VK.DOM.Event.Type.onPointerDown, this.canvas, function (e) { me.onTouchStart(e); });
            this.addListener(VK.DOM.Event.Type.onPointerMove, document, function (e) { me.onTouchMove(e); });
            this.addListener(VK.DOM.Event.Type.onPointerCancel, document, function (e) { me.onTouchEnd(e); });
            this.addListener(VK.DOM.Event.Type.onPointerUp, document, function (e) { me.onTouchEnd(e); });


            if (VK.DOM.Event.isMsPointer()) {
                var fixMe = function (el) {
                    // css way to prevent panning in our target area
                    if (typeof el['style']['msContentZooming'] != 'undefined') {
                        el['style']['msContentZooming'] = "none";
                    }
                    // new in Windows Consumer Preview: css way to prevent all built-in touch actions on our target
                    // without this, you cannot touch draw on the element because IE will intercept the touch events
                    if (typeof el['style']['msTouchAction'] != 'undefined') {
                        el['style']['msTouchAction'] = "none";
                    }
                };
                fixMe(container);
            }

            this.timeline = new Date().getTime();


            // show pause div button
            this.showPauseButton();

            this.setupTheme(this.context);
        },
        showPauseButton: function () {
            if (!this.isDesigning()) {
                VK.InGameMenu.showPauseButton();
            }
        },
        _calcPointerXYPixel: function (e) {
            // World height 1400
            // diff 600
            // calc scrollbars
            var canvasOffsets = VK.DOM.getCanvasOffset();

            var x = (canvasOffsets.x + document.body.scrollLeft +
                    document.documentElement.scrollLeft);

            var y = (canvasOffsets.y - document.body.scrollTop +
                    document.documentElement.scrollTop);

            var clientX = 0, clientY = 0;
            if (e.touches) {
                var isSingleTouch = e.touches.length === 1;
                if (isSingleTouch) {
                    clientX = e.touches[0].pageX;
                    clientY = e.touches[0].pageY;
                } else {
                    clientX = Math.abs(e.touches[0].pageX + e.touches[1].pageX) / 2;
                    clientY = Math.abs(e.touches[0].pageY + e.touches[1].pageY) / 2;
                }
            }
            else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            var ret = {
                x: (clientX - (x - this.Viewport.x)),
                y: ((clientY - y) + this.Viewport.y),
                canvasX: clientX - x,
                canvasY: clientY - y
            }

            if (isNaN(ret.x) || isNaN(ret.x)) {
                debugger
                return null;
            }

            return ret;
        },
        calcPointerXYPixel: function (e) {
            return this._calcPointerXYPixel(e);
        },
        calcPointerXY: function (e) {
            var coords = this._calcPointerXYPixel(e);
            this.INPUT.mouseX = coords.x / (this.WORLD_SCALE * this.zoom);
            this.INPUT.mouseY = coords.y / (this.WORLD_SCALE * this.zoom);
            this.INPUT.coords = coords;
        },
        onTouchEndAfter: function () { },
        onAfterDesignerRemoveEntity: function (entityName) {

        },
        onTouchEnd: function (e) {
            this.PreventDefaultManipulationAndMouseEvent(e);
            if (!this.isActive()) { return; }
            var bodyAtPointer = this.INPUT.isMouseDown && this.INPUT.isMouseDown.bodyAtPointer ? this.INPUT.isMouseDown.bodyAtPointer : null;

            if (this.scroller && !bodyAtPointer && this.INPUT.isMouseDown) {
                this.scroller.doTouchEnd(e.timeStamp);
            }

            if (bodyAtPointer) {
                var userData = bodyAtPointer.GetUserData();
                if (userData && userData.Entity) {
                    userData.Entity.touchend(e);
                }
            }

            if (this.isDesignMode()) {
                //info.entity.ENTITY_DESIGN_STATE = VK.CONSTANT.ENTITY_DESIGN_STATE.DELETE_CANDIDATE;
                var info = this.INPUT.isMouseDown && this.INPUT.isMouseDown.designer_selected_info ? this.INPUT.isMouseDown.designer_selected_info : null;
                if (info && info.entity.ENTITY_DESIGN_STATE == VK.CONSTANT.ENTITY_DESIGN_STATE.DELETE_CANDIDATE) {
                    // remove entity from deigner world
                    info.entity.setActive(false);
                    info.entity.destroy();
                    this.onAfterDesignerRemoveEntity(info.entity.name);
                    this.INPUT.isMouseDown.designer_selected_info = null;
                }
                else if (info && info.entity && info.entity.ENTITY_DESIGN_STATE == VK.CONSTANT.ENTITY_DESIGN_STATE.CREATED) {
                    info.entity.setPositionAndAngle();
                }
            }

            PubSub.publish(VK.CONSTANT.EVENT.MOUSEUP, { sling: this.MouseJoint ? true : false, selectedBody: bodyAtPointer });
            this.INPUT.isMouseDown = undefined;
            this.INPUT.mouseX = undefined;
            this.INPUT.mouseY = undefined;
            this.onTouchEndAfter();
        },
        onTouchStartDesignMode: function (e) {
            var bodiesFound = this.findBestBodiesAtPointer();
            if (bodiesFound && bodiesFound.length > 0) {
                var fixture = bodiesFound[0];
                var userData = fixture.GetBody().GetUserData();
                var isSelected = userData.Entity.getIsSelected();

                var action = VK.CONSTANT.DESIGNER.MOVE;

                if (isSelected && bodiesFound.length == 1 && userData.action == VK.CONSTANT.DESIGNER.ROTATE) {
                    action = VK.CONSTANT.DESIGNER.ROTATE;
                }
                else {
                    // first time selection or just moving
                    action = VK.CONSTANT.DESIGNER.MOVE;
                }
                return { action: action, entity: userData.Entity, ENTITY_DESIGN_STATE: VK.CONSTANT.ENTITY_DESIGN_STATE.CREATED };

            }
            return null;
        },
        onTouchStartAfter: function () { },
        onTouchStart: function (e) {
            this.PreventDefaultManipulationAndMouseEvent(e);
            if (!this.isActive()) { return; }
            this.calcPointerXY(e);

            var foundItem = null, entity = null;
            if (!this.isDesignMode()) {
                if (!this.MouseJoint) {
                    foundItem = this.findBestBodyAtPointer() || null;
                }
                var allowPointer = true;
                if (foundItem) {
                    this.scrolling = false;
                    var userData = foundItem.GetUserData();
                    if (userData && userData.Entity) {
                        entity = userData.Entity;
                        allowPointer = VK.isDebugMode();
                        if (this.isLevelComplete() === false && userData.Entity.getAllowPointer()) {
                            allowPointer = true;
                        }
                        if (allowPointer) {
                            userData.Entity.touchstart(e, foundItem); // foundItem b2Body
                            // skip event processing for balloons???
                            if (userData.Entity.name == VK.CONSTANT.BALLON) {
                                foundItem = null;
                            }
                        }
                    }
                }
                if (allowPointer) {
                    this.INPUT.isMouseDown = { x: this.INPUT.mouseX, y: this.INPUT.mouseY, bodyAtPointer: foundItem };
                }
            }
            else {
                foundItem = this.onTouchStartDesignMode(e);
                this.setDesignerSelectEntity(foundItem);
            }

            if (this.scroller && !foundItem) {
                this.scroller.doTouchStart([{
                    pageX: e.pageX,
                    pageY: e.pageY
                }], e.timeStamp);
            }
            this.onTouchStartAfter();
        },
        onTouchMoveDesignMode: function (e) {
            var info = this.INPUT.isMouseDown.designer_selected_info;
            var entity = info.entity;
            var pos = this.INPUT.coords;
            if (info.action == 'ROTATE') {
                var originX = entity.x + (entity.sprite.width / 2);
                var originY = entity.y + (entity.sprite.height / 2);
                var mouseX = pos.x;
                var mouseY = pos.y;

                var angle = Math.atan2((mouseY - originY), (mouseX - originX));
                angle = angle + (Math.PI / 4);

                entity.setAngle(angle);
                //console.debug('angle: ' + angle);

            }
            if (info.action == 'MOVE') {
                entity.setX(pos.x);
                entity.setY(pos.y);
            }

            //            console.debug('x: ' + pos.x);
            //            console.debug('y: ' + pos.y);
        },
        onTouchMoveAfter: function (options) { },
        onTouchMove: function (e) {
            this.PreventDefaultManipulationAndMouseEvent(e);
            if (!this.isActive()) { return; }
            this.calcPointerXY(e);

            if (this.scroller && this.INPUT.isMouseDown && (!this.INPUT.isMouseDown.bodyAtPointer && !this.INPUT.isMouseDown.designer_selected_info)) {
                this.scroller.doTouchMove([{
                    pageX: e.pageX,
                    pageY: e.pageY
                }], e.timeStamp, e.scale);
            }
            var info = null;
            if (this.INPUT.isMouseDown && this.INPUT.isMouseDown.designer_selected_info) {
                this.onTouchMoveDesignMode(e);
                info = this.INPUT.isMouseDown.designer_selected_info;

                var toolbox_h = this.toolbox.h + 13;    // add 20 for padding
                //console.log('canvasY: ' + this.INPUT.coords.canvasY + ' canvasHeight: ' + this.canvasHeight + ' toolbox_h: ' + toolbox_h)

                if (this.INPUT.coords.canvasY < this.canvasHeight - toolbox_h) {
                    //console.debug('foo: ' + new Date().getTime())
                    // mark entity completed transition out of toolbox
                    info.entity.ENTITY_DESIGN_STATE = VK.CONSTANT.ENTITY_DESIGN_STATE.CREATED;
                }
                else {
                    info.entity.ENTITY_DESIGN_STATE = VK.CONSTANT.ENTITY_DESIGN_STATE.DELETE_CANDIDATE;
                }
            }

            if (this.INPUT.isMouseDown && this.INPUT.isMouseDown.bodyAtPointer) {
                var userData = this.INPUT.isMouseDown.bodyAtPointer.GetUserData();
                if (userData && userData.Entity) {
                    userData.Entity.touchmove(e);
                }
            }
            this.onTouchMoveAfter({ entity: info ? info.entity : null });
            PubSub.publish(VK.CONSTANT.EVENT.MOUSEMOVE, e);
        },
        drawScore: function (ctx) {
            if (!this.isDesigning()) {
                if (!this.__starImage) {
                    this.__starImage = jaws.assets.get("assets/ingame/stars-level-status.png");
                }

                var px = this.stars.length;
                var starCount = this.stars.length;

                if (starCount == 1) {
                    px = 73;
                }
                else if (starCount == 2) {
                    px = 146;
                }
                else if (starCount > 2) {
                    px = 219;
                }
                ctx.drawImage(this.__starImage, px, 0, 73, 24, ctx.canvas.width - 80, 3, 73, 24);
                
                if (this.isUnlimitedLife() === false) {
                    var lifeCounter = this.getLifeCounter();
                    if (lifeCounter > 0) {
                        // counter always has whats a live including the one in play
                        var ico = VK.InGame.PlayerBall.getSmallIcon();
                        for (var i = lifeCounter; i > 0; i--) {
                            var l = (i * 20) + 16;
                            ctx.drawImage(ico, 0, 0, 72, 72, ctx.canvas.width - l, 30, 32, 32);
                        }
                    }
                }
            }
            this.drawFps();
        },
        getBodyAtMouse: function () {
            this.INPUT.mousePVec = new b2Vec2(this.INPUT.mouseX, this.INPUT.mouseY);
            var aabb = new b2AABB();
            var offset = this.isTouchAction ?
            // calc base on zoom
                (1 + Math.abs(1 - this.zoom))
                : 0.001;
            //document.getElementById('debug').innerHTML = 'zoom: ' + (1 + Math.abs(1 - this.zoom)) + ' ' + this.isTouchAction
            //http://stackoverflow.com/questions/7900798/objectice-c-and-box2d-multiple-sprite-touch-detection
            aabb.lowerBound.Set(-offset + this.INPUT.mouseX, -offset + this.INPUT.mouseY);
            aabb.upperBound.Set(offset + this.INPUT.mouseX, offset + this.INPUT.mouseY);

            // Query the World for overlapping shapes.
            this.SelectedBody = null;
            this.b2World.QueryAABB(this.getBodyCB.bind(this), aabb);
            return this.SelectedBody;
        },
        findBestBodiesAtPointer: function () {
            this.INPUT.mousePVec = new b2Vec2(this.INPUT.mouseX, this.INPUT.mouseY);
            var points = [0.001, 0.25, 0.5, 1.0];
            this.SelectedBody = null;
            for (var i = 0; i < points.length; i++) {
                var offset = points[i];
                if (i > 0) {
                    offset = points[i] + Math.abs(1 - this.zoom);
                }

                var aabb = new b2AABB();
                aabb.lowerBound.Set(-offset + this.INPUT.mouseX, -offset + this.INPUT.mouseY);
                aabb.upperBound.Set(offset + this.INPUT.mouseX, offset + this.INPUT.mouseY);
                this.b2World.QueryAABB2(function (list) {
                    this.SelectedBodies = list;
                }.bind(this), aabb);

                if (this.SelectedBodies) {
                    return this.SelectedBodies;
                }
            }
            return null;
        },
        findBestBodyAtPointer: function () {
            this.INPUT.mousePVec = new b2Vec2(this.INPUT.mouseX, this.INPUT.mouseY);
            var points = [0.001, 0.25, 0.5, 1.0];
            this.SelectedBody = null;
            for (var i = 0; i < points.length; i++) {
                var offset = points[i];
                if (i > 0) {
                    offset = points[i] + Math.abs(1 - this.zoom);
                }

                var aabb = new b2AABB();
                aabb.lowerBound.Set(-offset + this.INPUT.mouseX, -offset + this.INPUT.mouseY);
                aabb.upperBound.Set(offset + this.INPUT.mouseX, offset + this.INPUT.mouseY);
                this.b2World.QueryAABB2(this.getBodyCB.bind(this), aabb);

                if (this.SelectedBody) {
                    return this.SelectedBody;
                }
            }
            return null;
        },
        getBodyCB: function (list) {
            if (!list) {
                return;
            }
            this.SelectedBody = null;
            for (var i = list.length - 1; i >= 0; i--) {
                var fixture = list[i];
                var userData = fixture.GetBody().GetUserData();
                if (fixture.GetBody().GetType() != b2Body.b2_staticBody || this.isDesignMode()) {
                    if (userData && userData.Name != VK.CONSTANT.ROPE) {
                        if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this.INPUT.mousePVec)) {
                            this.SelectedBody = fixture.GetBody();
                            break;
                        } // pick some random ovelaping enities OR player
                        else if (!this.SelectedBody || userData.Name == VK.CONSTANT.PLAYER) {
                            this.SelectedBody = fixture.GetBody();
                        }
                    }
                }
            }
        },
        // destroy all the bodies and joins and null out entities
        clearWorld: function () {
            if (this.player) {
                this.player.destroy();
                this.player = null;
            }
            this._super();
        },
        setupB2D: function () {
            if (isDebugDraw) {
                var debugDraw = new b2DebugDraw();
                // hack clear method...bug!!! in rendering
                debugDraw.m_sprite.graphics.clear = function () { };
                debugDraw.SetSprite(this.context);
                debugDraw.SetDrawScale(this.WORLD_SCALE);
                debugDraw.SetFillAlpha(0.5);
                debugDraw.SetLineThickness(1.0);
                debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                this.b2World.SetDebugDraw(debugDraw);
            }
        },
        getDirectorTime: function () {
            return this.directorScene.time;
        },
        setupWorldWalls: function () {
            this.walls = [];
            // NOTE: box2 create rect w/2
            VK.Box2dUtils.generateWallSensor(this.b2World, this.WORLD_WIDTH, this.WALL_PADDING / 2, 0, 0); // ceil wall
            VK.Box2dUtils.generateWallSensor(this.b2World, this.WALL_PADDING / 2, this.WORLD_HEIGHT, this.WALL_PADDING / 2, this.WORLD_HEIGHT - this.WALL_PADDING / 2); // left wall
            VK.Box2dUtils.generateWallSensor(this.b2World, this.WALL_PADDING / 2, this.WORLD_HEIGHT, this.WORLD_WIDTH - this.WALL_PADDING / 2, 0); // right wall

            //VK.Box2dUtils.generateWall(this.b2World, this.WORLD_WIDTH, this.WALL_PADDING / 2, 0, this.WORLD_HEIGHT - this.WALL_PADDING / 2); // groound wall
            this.walls.push(new VK.InGame.Wall.BOTTOM({ // groound wall
                WALL_PADDING: this.WALL_PADDING,
                WORLD_WIDTH: this.WORLD_WIDTH,
                WORLD_HEIGHT: this.WORLD_HEIGHT,
                b2World: this.b2World
            }));
        },
        doLevelEndScene: function () {
            this.enemies = null;
            var wait = this.isLifeDONE() ? 1000 : 3000;
            // GAMES OVER USER HAVE KILLED ALL ENEMIES
            var me = this;
            var isDesignModeRunning = this.isDesignModeRunning();
            if (this.directorScene) {
                var failed = this.isLifeDONE();
                //                var failed = true;
                //                if (this.stars.length > 0) {
                //                    failed = false;
                //                }
                this.createTimer(
                    wait,
                    function () {
                        me.pause();
                        VK.GameHelper.setLevelData(me);
                        VK.GameHelper.unlockNextLevel(me);
                        new VK.LevelCompleteDOM({ gameState: me, failed: failed, isDesignModeRunning: isDesignModeRunning });
                    },
                    null,
                    null
                );
            }
        },
        isLifeDONE: function () {
            return !this.isDesignMode() && !this.isDesignModeRunning() && !this.isUnlimitedLife() && this.getLifeCounter() <= 0;
        },
        checkLevelCompleteRULE: function () {
            // OVERRIDE THIS METHOD TO CHANGE LEVEL COMPLETE

            /// RULES HERE:
            /// 1. if enemies are available game wouldnt be complete until all killed
            /// 2. if no enemies in level, than all stars taken will be considered level complete!
            /// 3. LEVEL DESINGER WILL HAVE RULE 2, GET ALL THE STARS TO COMPLETE LEVEL ???????
            if (!this.isDesignMode() && !this.isDesignModeRunning() && (
                // 1.
                this.getEnemiesTotal() && this.enemies && this.enemies.length == 0 ||
                // 2.
                !this.getEnemiesTotal() && this.getStarsTotal() && this.getStarsTotal() == this.stars.length) ||
                // 3.
                !this.isDesignMode() && this.isDesignModeRunning() && this.getEnemiesTotal() && this.enemies && this.enemies.length == 0 ||
                // 4. ran out of life
                this.isLifeDONE()

            ) {
                return true;
            }
            return false;
        },
        setCanShare: function (v) { },
        checkLevelCompleted: function () {
            if (!this.m__levelIsComplete && this.checkLevelCompleteRULE()) {
                this.m__levelIsComplete = true;

                if (!this.isLifeDONE()) {
                    PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'level_complete' });
                }
                else {
                    PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAYSOUND, { soundId: 'level_failed' });
                }
                if (!this.isUnlimitedLife() && this.getLifeCounter() > 0) {
                    // give bonuses for available lives
                    this.addScore(this.getLifeCounter() * 1000);
                }

                this.doLevelEndScene();
                this.setCanShare(true);

                if (this.levelDef && this.levelDef.id.indexOf('set-0-level-0') != -1) {
                    // unlock feature after finishing first level
                    PubSub.publish(VK.CONSTANT.PUBSUB.LEVEL_COMPLETE, { options: this });
                }
            }
        },
        isLevelComplete: function () {
            return this.m__levelIsComplete;
        },
        checkPlayOutOfBound: function () {
            // OVERRIDE THIS FOR OTHER GAME RULE
            if (this.player && !this.player.islink()) {
                var coords = this.player.getPixelPosition();
                if (!coords) { return; }
                //console.log('x: ' + coords.x);
                if (coords.x < -(this.player.w) || (coords.x - (this.player.w * 2)) > this.WORLD_WIDTH) {
                    this.player.recreate();
                }

            }
        },
        updateBefore: function () { },
        updateAfter: function () { },
        update: function () {

            var t = new Date().getTime(),
                    delta = t - this.timeline;
            this.updateBefore();
            /*
            check for massive frame time. if for example the current browser tab is minified or taken out of
            foreground, the system will account for a bit time interval. minify that impact by lowering down
            the elapsed time (virtual timelines FTW)
            */
            if (delta > 500) {
                delta = 500;
            }

            if (this.INPUT.isMouseDown && (!this.MouseJoint) && this.INPUT.isMouseDown.bodyAtPointer) {
                var body = this.INPUT.isMouseDown.bodyAtPointer;
                if (body) {
                    var md = new b2MouseJointDef();
                    md.bodyA = this.b2World.GetGroundBody();
                    md.bodyB = body;
                    md.target.Set(this.INPUT.mouseX, this.INPUT.mouseY);
                    md.collideConnected = true;
                    md.maxForce = 300.0 * body.GetMass();
                    this.MouseJoint = this.b2World.CreateJoint(md);
                    body.SetAwake(true);
                }
            }
            if (this.MouseJoint) {
                if (this.INPUT.isMouseDown) {
                    this.MouseJoint.SetTarget(new b2Vec2(this.INPUT.mouseX, this.INPUT.mouseY));
                } else {
                    this.b2World.DestroyJoint(this.MouseJoint);
                    this.MouseJoint = null;
                }
            }
            var isDesignMode = this.isDesignMode();
            if (!isDesignMode) {
                this.b2World.Step(VK.Box2D.TIMESTEP, VK.Box2D.VELOCITY_ITERATIONS, VK.Box2D.POSITION_ITERATIONS); //performs a time step in the box2d simulation
                this.b2World.ClearForces(); //used to clear the forces after performing the time step
            }
            // Tries to center Viewport around player.x / player.y.
            // It won't go outside of 0 or outside of our previously specified max_x, max_y values.
            //            if (this.player) {
            //                this.player.update(delta);

            //                //if (this.mouseStars) {

            //                //    this.mouseStars({ point: { x: this.player.sprite.x * this.zoom, y: this.player.sprite.y * this.zoom} });
            //                //}
            //            }
            if (this.scroller && this.scrolling) {
                var coords = this.scroller.getValues();
                if (!isNaN(coords.left) && !isNaN(coords.top)) {
                    this.Viewport.moveTo(coords.left, coords.top);
                }
            }
            if ((!isDesignMode && this.player && !this.player.islink()) || (this.player && this._mCenterAroundOnStart === true)/*|| (this.INPUT.isMouseDown && this.INPUT.isMouseDown.bodyAtPointer)*/) { // only follow when not scrolling and not linked
                if (this.player) {
                    if (!this.player.slingStart) {
                        this.Viewport.centerAround(this.player.sprite, this.zoom);
                    }
                    else {
                        //  player right side of peg
                        if (this.player.slingStart.ex === undefined || this.player.slingStart.sx === undefined) {
                            this.player.slingStart = null;
                        }
                        if (this.player.slingStart && (this.player.slingStart.ex < this.player.slingStart.sx &&
                            this.player.sprite.x > this.player.slingStart.sx || 
                            //  player left side of peg
                            this.player.slingStart.ex > this.player.slingStart.sx && 
                            this.player.sprite.x < this.player.slingStart.sx ||

                            //  player bottom of peg
                            this.player.slingStart.ey > this.player.slingStart.sy &&
                            this.player.sprite.y < this.player.slingStart.sy ||

                            //  player bottom of peg
                            this.player.slingStart.ey < this.player.slingStart.sy &&
                            this.player.sprite.y > this.player.slingStart.sy))
                        {
                            
                            this.Viewport.centerAround(this.player.sprite, this.zoom);
                            this.player.slingStart = null;
                        }
                    }
                    // we already center around player for the first time
                    this._mCenterAroundOnStart = false;
                    this.scrolling = false;
                    //if (this.parallax && this.player.b2Body.GetLinearVelocity().x > 0) {
                    //    this.parallax.camera_x += 1;
                    //}
                    //if (this.parallax && this.player.b2Body.GetLinearVelocity().x < 0) {
                    //    this.parallax.camera_x -= 2;
                    //}
                }
            }

            if (this.scroller && !this.scrolling) {
                this.scroller.updateScroll(this.Viewport.x, this.Viewport.y);
            }

            var walls = this.walls;

            if (walls) {
                for (var i = 0; i < walls.length; i++) {
                    var w = walls[i];
                    w.update(delta);
                }
            }

            var deadActiveEntities = [];
            var entities = this.getEntities();
            if (entities) {
                for (var i = 0; i < entities.length; i++) {
                    var entity = entities[i];
                    if (entity.isActive()) {
                        entity.update(delta);
                    }
                    else {
                        deadActiveEntities.push(entity);
                    }
                }
            }
            // remove dead entities
            if (deadActiveEntities.length) {
                var len = deadActiveEntities.length;
                for (var j = 0; j < len; j++) {
                    var entityToRemove = deadActiveEntities[j];
                    this.addScore(entityToRemove.getValue());

                    if (entityToRemove.getIsEnemy()) {
                        this.removeEntityFromArray(this.enemies, entityToRemove);
                    }
                    else if (entityToRemove.getIsStar()) {
                        this.stars.push(entityToRemove);
                    }
                    entityToRemove.destroy();
                }
            }

            // remove any b2body ready to be dispose
            if (this._b2BodiesScheduledForRemoval && this._b2BodiesScheduledForRemoval.length) {
                for (var y = 0; y < this._b2BodiesScheduledForRemoval.length; y++) {
                    this.b2World.DestroyBody(this._b2BodiesScheduledForRemoval[y]);
                }
                this._b2BodiesScheduledForRemoval = null;
            }

            // exec any methods
            if (this._execOnUpdate && this._execOnUpdate.length) {
                for (var m = 0; m < this._execOnUpdate.length; m++) {
                    this._execOnUpdate[m]();
                }
                this._execOnUpdate = null;
            }
            this.checkPlayOutOfBound();
            this.checkLevelCompleted();
            this.timeline = t;
            this.updateAfter();
        },
        drawBefore: function (ctx) { },
        drawAfter: function (ctx) { },
        draw: function () {
            jaws.clear();
            var me = this;
            if (this.m__gradient) {
                this.context.fillStyle = this.m__gradient
                this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            }

            this.Viewport.apply(function () {
                // draw here
                var context = me.context;
                var zoom = me.zoom;

                context.scale(zoom, zoom);

                me.drawBefore(context);
                var backgrounds = me.__backgrounds;

                if (backgrounds) {
                    for (var m = 0; m < backgrounds.length; m++) {
                        backgrounds[m].draw(context);
                    }
                }

                //if (me.background) {
                //    me.background.draw(me.context);
                //}
                if (typeof CAAT != 'undefined' && me.director) {
                    var t = new Date().getTime();
                    var dr = me.director;
                    if (dr.renderMode === CAAT.Director.RENDER_MODE_CONTINUOUS || dr.needsRepaint) {
                        dr.renderFrame();
                    }
                    t = new Date().getTime() - t;
                    CAAT.FRAME_TIME = t;

                    if (CAAT.RAF) {
                        CAAT.REQUEST_ANIMATION_FRAME_TIME = new Date().getTime() - CAAT.RAF;
                    }
                    CAAT.RAF = new Date().getTime();
                };

                //jaws.context.drawImage(document.getElementById("cloud1"), me.WORLD_WIDTH - 200, 400);

                // ff bug debug draw clear out bg image canvas
                if (isDebugDraw) {
                    me.b2World.DrawDebugData();
                }
                //                if (me.player) {
                //                    me.player.draw(me.context);
                //                }

                var walls = me.walls;

                if (walls) {
                    for (var i = 0; i < walls.length; i++) {
                        var w = walls[i];
                        w.draw(context, me.timeline);
                    }
                }

                var entities = me.getEntities();
                var sb = [];
                if (entities) {
                    for (var i = 0; i < entities.length; i++) {
                        var e = entities[i];
                        e.draw(context, me.timeline);
                    }
                }

                me.drawAfter(context);
            });

            this.drawScore(me.context);

            //document.getElementById('debug').innerHTML = 'view x: ' + this.Viewport.x + '   view y: ' + this.Viewport.y;
        }
    });

})();