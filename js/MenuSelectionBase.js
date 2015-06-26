(function () {
    VK.Levels = Class.extend({
        id: (new Date()).getTime(),
        dom: null,
        categoryIndex: 0, // index of levels category in VK.GameData
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        getCount: function () {
            return this.levelsData ? this.levelsData.levels.length : 0;
        },
        setupEvents: function () {
            var me = this;

            var distance = 0;

            var fingerCount = 0,
                start = { x: 0, y: 0 },
                end = { x: 0, y: 0, longest: 0 },
                delta = { x: 0, y: 0 },
                startTime = 0,
                endTime = 0,
                fingers = 1,
                threshold = 34, //75,
                pointerDown = false;

            var dom = this.dom;

            function calculateDistance() {
                return Math.round(Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)));
            }

            function validateSwipeDistance() {
                return distance >= threshold;
            }

            var parent = this.parent;

            function hide() {
                parent.destroy();
            }

            this.addListener(VK.DOM.Event.Type.onPointerDown, dom, function (e) {
                start.x = end.x = e.pageX;
                start.y = end.y = e.pageY;
                end.longest = 0;
                startTime = (new Date()).getTime();
                pointerDown = true;
            });
            this.addListener(VK.DOM.Event.Type.onPointerMove, dom, function (e) {
                end.x = e.pageX;
                end.y = e.pageY;

                var d = Math.round(Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)))

                if (d > end.longest) {
                    end.longest = d;
                }
                pointerDown = true;
                endTime = (new Date()).getTime();
            });
            this.addListener(VK.DOM.Event.Type.onPointerCancel, dom, function (e) {
                fingerCount = 0;

                start.x = 0;
                start.y = 0;
                end.x = 0;
                end.y = 0;
                end.longest = 0;
                delta.x = 0;
                delta.y = 0;
                pointerDown = false;
                endTime = 0;
                startTime = 0;
            });
            this.addListener(VK.DOM.Event.Type.onPointerUp, dom, function (e) {
                endTime = (new Date()).getTime();
                distance = calculateDistance();
                if (pointerDown && !validateSwipeDistance() && end.longest < threshold) {
                    
                    if (e.target.className.indexOf('btn-level') != -1 || e.target.getAttribute('levelId')) {
                        // check for hidden buttons use as placeholders
                        if (this.isMyLevel && e.target.className.indexOf('ingame-newLevelButton-hidden') == -1) {
                            // do edit/new level here
                            this.parent.loadOrDeleteLevelInDesigner(this.categoryIndex, e.target.getAttribute('levelId'), this.getCount());
                        }
                        else {
                            var levelIndex = parseInt(e.target.getAttribute('levelIndex'));
                            var levelsData = this.levelsData;

                            if (!this.levelsData.levels[levelIndex]) {
                                return;
                            }

                            // TODO: SHOULD WE USE STRING HASH SO COMPILER DONT TOUCH ????
                            this.parent.loadLevel(levelsData, this.categoryIndex, levelIndex);
                        }
                    }
                }
                pointerDown = false;
            } .bind(this));

        },
        init: function (options) {
            this.set(options);
            var sb = ['<table border=0 cellpadding=0 class="' + this.pageCls + '" cellspacing=0 style="width:' + this.width + 'px; height:' + this.height + 'px; borderXX:2px solid blue;">'];
             
            // TODO: SHOULD WE USE STRING HASH SO COMPILER DONT TOUCH ????
            this.generateBar(sb, 'top', this.levelsData.name);

            var levels = this.levelsData.levels.length;
            var row_percolumn = 6;
            var row_max = 2;
            var loop = Math.ceil(levels / row_percolumn)
            // we only support 12 levels per card
            var columns = levels;
            if (levels > row_percolumn) {
                columns = levels / row_max;
            }

            if (this.leftAlign) {
                loop = 2;
                columns = 6;
            }


            var DESIGN_LEVEL_DEF = VK.CONSTANT.DESIGN_LEVEL_DEF;

            sb.push('<tr>');
            sb.push('<td style="height:50%;" valign=middle align=center>');
            sb.push('<table>');
            var cursor = 0;

            for (var i = 0; i < loop; i++) {
                sb.push('<tr>');
                for (var k = 0; k < columns; k++) {

                    var levelData = this.levelsData.levels[cursor];

                    sb.push('<td style="padding:4px;">');
                    sb.push('<table border=0 style="display:inline-block;" cellpadding=0 cellspacing=0>');
                    sb.push('<tr>');
                    sb.push('<td>');
                    if (levelData) {
                        if (this.isMyLevel) {
                            if (levelData.newLevel === true) {
                                sb.push('<div levelIndex="' + cursor + '" id="btn' + this.id + '-' + cursor + '" class="btn-level ingame-newLevelButton"/>');
                            }
                            else {
                                var levelId = levelData[DESIGN_LEVEL_DEF.ID];
                                var iconDataURL = levelData[DESIGN_LEVEL_DEF.SCREENSHOT];

                                sb.push('<div levelIndex="' + cursor + '" id="btn' + this.id + '-' + cursor + '" class="btn-level ingame-myLevelButton" levelId="' + levelId + '">');
                                sb.push('<div style="display:block;">');
                                if (this.isDeleteMode === true) {
                                    sb.push('<div style="position:absolute;" class="level-myLevel-delete" levelId="' + levelId + '"></div>');
                                }
                                else {
                                    sb.push('<div style="position:absolute; display:none;" class="level-myLevel-delete" levelId="' + levelId + '"></div>');
                                }
                                sb.push('<IMG levelIndex="' + cursor + '" levelId="' + levelId + '" class="btn-level ingame-myLevelButton-img" src="');
                                sb.push(iconDataURL);
                                sb.push('" />');
                                sb.push('</div>');
                                sb.push('</div>');
                            }
                        }
                        else if (levelData.unlock === true) {
                            if (levelData.starsCount !== undefined && levelData.starsCount > 0) {
                                // cut back star count over 3
                                var stars = levelData.starsCount;
                                if (stars > 3) {
                                    stars = 3;
                                }
                                sb.push('<div levelIndex="' + cursor + '" id="btn' + this.id + '-' + cursor + '" class="btn-level LevelButtonUnlock-Star' + (stars) + '"/>');
                            }
                            else {
                                sb.push('<div levelIndex="' + cursor + '" id="btn' + this.id + '-' + cursor + '" class="btn-level LevelButtonUnlock"/>');
                            }

                            var sb2 = [
                                '<table class="fill btn-level" border=0 levelIndex="' + cursor + '" cellpadding=0 cellspacing=0>',
                                    '<tr levelIndex="' + cursor + '" class="btn-level">',
                                        '<td levelIndex="' + cursor + '" valign=middle align=center class="btn-level level-btn-number-label">',
                                            levelData.dynamicIndex,
                                        '</td>',
                                    '</tr>',
                                '</table>'
                            ];
                            sb.push(sb2.join(''));

                        }
                        else {
                            sb.push('<div levelIndex="' + cursor + '" id="btn' + this.id + '-' + cursor + '" class="btn-level LevelButtonLock"/>');
                        }
                    }
                    else {
                        sb.push('<div levelIndex="' + cursor + '" id="btn' + this.id + '-' + cursor + '" class="btn-level ingame-newLevelButton-hidden"/>');
                    }
                    sb.push('</td>');
                    sb.push('</tr>');
                    sb.push('<tr>');
                    sb.push('<td valign=middle align=center></td>');
                    sb.push('</tr>');
                    sb.push('</table>');
                    sb.push('</td>');

                    cursor++;
                }
                sb.push('</tr>');
            }
            sb.push('</table>');
            sb.push('</td><tr/>');
            this.generateBar(sb, 'bottom', '');

            // begin tab circle
            sb.push('<tr>');
            sb.push('<td valign=middle align=center">');

            if (this.tabCount > 1) {
                for (var m = 0; m < this.tabCount; m++) {
                    if (this.categoryIndex == m) {
                        sb.push('<span class="level-tab-selected"></span>');
                    }
                    else {
                        sb.push('<span class="level-tab"></span>');
                    }
                }
            }
            sb.push('</td>');
            sb.push('</tr>');
            // end tab circle

            sb.push('</table>');

            VK.DOM.setInnerHTML(this.dom, sb.join(''));

            this.setupEvents();
        },
        generateBar: function (sb, type, title) {
            sb.push('<tr>');
            sb.push('<td valign=bottom align=center id="' + type + this.id + '" style="color:#fff; height:25%;">');
            if (title) {
                sb.push('<label class="level-selection-label">' + title + '</label>');
            }
            sb.push('</td>');
            sb.push('</tr>');
        }
    });

    VK.MenuSelectionBase = VK.GameStateBase.extend({
        clientWidth: 0,
        clientHeight: 0,
        cardsCount: 0,
        __mousedown: false,
        WALL_PADDING: 20,
        entities: null,
        dolerp: false,
        active: true,
        isActive: function () {
            return this.active;
        },
        loadLevel: function (levelsData, categoryIndex, levelIndex) {
            // TODO: SHOULD WE USE STRING HASH SO COMPILER DONT TOUCH ????
            if (VK.GameHelper.isLevelUnLock(levelsData.levels[levelIndex])) {
                this.hide();
                VK.GameHelper.loadLevel(categoryIndex, levelIndex, this.callback_back);
            }
        },
        hide: function () {
            this.active = false;
            if (this.container) {
                this.container.style.display = 'none';
            }
            this.hideDOMBackButton();
            this.hideLevelAddButton();
            // we dont reuse this class so destory it
            this.destroy();
        },
        show: function () {
            this.active = true;
            this.container.style.display = '';
            this.showDOMBackButton();
        },

        destroy: function () {
            this.clearWorld();
            this.removeListeners();
            if (this.levels) {
                for (var i = 0; i < this.levels.length; i++) {
                    this.levels[i].removeListeners();
                }
            }
            if (this.container) {
                this.container.style.display = 'none';
            }
            this.container = null;
            this.b2World = null;
            this.content = null;
        },
        setupB2D: function () {
        },
        loadGameData: function () {},
        setActiveCard: function (categoryIndex, animate) {
            var card = this.levels[categoryIndex];
            if (!card) {
                return;
            }
            //var me = this;
            // defer for 300 ms, make animation maybe look better???
            //window.setTimeout(function () {
            this.scroller.scrollTo(card.left, 0, animate !== undefined ? animate : false);
            //}, 300);
        },
        init: function (options) {
            this.set(options);
        },
        loadOrDeleteLevelInDesigner: function (categoryIndex, levelId, levelCount) {
            if (levelId && this.isDeleteLevelMode()) {
                // do level delete
                // adjust showing card
                if( levelCount <= 2 && categoryIndex > 0){
                    categoryIndex = categoryIndex - 1;
                }
                VK.DOM.Wait.show();
                VK.GameHelper.deleteLevel(levelId, function callback(categoryIndexToShow) {
                    this.hide();
                    VK.GameHelper.setCurrentCategorySet(VK.GameHelper.getDesignerLevelSet(), this.callback_back, categoryIndexToShow, true);
                    VK.DOM.Wait.hide();
                }.bind(this), categoryIndex);
            }
            else {

                //if (/*VK.GameHelper.isTrialLicense()*/ VK.AddSupported === true && !levelId &&
                //    this.categorySet.levelSet[0] && 
                //    this.categorySet.levelSet[0].levels.length >
                //    VK.GameHelper.freeTrialCreateLevelsCount()) {

                //    VK.Howto.showBuyDialog(function () {
                //        VK.GameHelper.doTrialConversion();
                //    });

                   
                //    return;
                //}

                this.hide();
                var callback_back = function (options) {
                    
                    var categoryIndexToShow = this.currentCategoryIndex;
                     // new level create
                    if (!options.levelId || options.isNew === true)
                    {
                        if (this.levels[this.levels.length - 1].levelsData.levels.length < VK.GameHelper.LEVELS_PER_CARD) {
                            categoryIndexToShow = this.levels.length - 1;
                        }
                        else {
                            // move to new next tab
                            categoryIndexToShow = this.levels.length;
                        }
                    }
                    this.hide();
                    // pass along callback_back
                    VK.GameHelper.setCurrentCategorySet(VK.GameHelper.getDesignerLevelSet(), this.callback_back, categoryIndexToShow, false);
                };
                
                if (!levelId && this.isDeleteLevelMode()) {
                    // creating new level while in delete mode/ toggle out of delete mode
                    this.__toggleDeleteLevelIcon();
                }
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, { play: false });
                VK.GameHelper.loadLevelDesigner({ callback_back: callback_back.bind(this), levelId: levelId });
            }
        },
        isDeleteLevelMode: function () {
            return this.m_LevelTranshcanButton && this.m_LevelTranshcanButton.className == 'ingame-btn-trashcan-on';
        },
        
        __toggleDeleteLevelIcon: function () {

            var isDeleteMode = this.isDeleteLevelMode();

            var display = 'none';

            if (!isDeleteMode) {
                this.m_LevelTranshcanButton.className = 'ingame-btn-trashcan-on';
                display = '';
            }
            else {
                this.m_LevelTranshcanButton.className = 'ingame-btn-trashcan';
            }
            if (this.content) {
                var elements = this.content.getElementsByClassName('level-myLevel-delete');

                for (var i = 0; i < elements.length; i++) {
                    if (elements[i]) {
                        elements[i].style.display = display;
                    }
                }
            }
            //this.m_LevelAddButton.style.visibility = display == '' ? 'hidden' : 'visible';
        },
        showLevelAddButton: function () {
            if (!this.m_LevelBtnsRightWrapper) {
                this.m_LevelBtnsRightWrapper = VK.DOM.createDiv(null, "float-right", VK.DOM.getContainer());

                if (VK.DesignerPROP.showDesignerPropDialog()) {
                    this.m_LevelPropButton = VK.DOM.createDiv(null, "ingame-btn-main", this.m_LevelBtnsRightWrapper);
                    this.m_LevelPropButton.style.display = 'inline-block';
                    this.m_LevelPropButton.style.marginRight = '10px';
                    VK.DOM.Event.onPointerDown(this.m_LevelPropButton, function (e) {
                        VK.DesignerPROP.showDesignerProp();
                    }.bind(this));
                }
                
                this.m_LevelAddButton = VK.DOM.createDiv(null, "ingame-btn-add", this.m_LevelBtnsRightWrapper);
                this.m_LevelAddButton.style.display = 'inline-block';
                this.m_LevelAddButton.style.marginRight = '10px';
                //this.m_LevelAddButton.style.border = '1px solid red'
                this.m_LevelTranshcanButton = VK.DOM.createDiv(null, this.isDeleteLevelMode() || this.isDeleteMode === true ? "ingame-btn-trashcan-on" : "ingame-btn-trashcan", this.m_LevelBtnsRightWrapper);
                this.m_LevelTranshcanButton.style.display = 'inline-block';
                
                VK.DOM.Event.onPointerDown(this.m_LevelTranshcanButton, function (e) {
                    this.__toggleDeleteLevelIcon();
                }.bind(this));


                VK.DOM.Event.onPointerDown(this.m_LevelAddButton, function (e) {
                    if (this.isDeleteLevelMode()) {
                        // creating new level while in delete mode/ toggle out of delete mode
                        this.__toggleDeleteLevelIcon();
                    }

                    this.loadOrDeleteLevelInDesigner();
                } .bind(this));
            }
            this.m_LevelBtnsRightWrapper.style.display = '';
        },
        hideLevelAddButton: function () {
            if (this.m_LevelBtnsRightWrapper) {
                this.m_LevelBtnsRightWrapper.style.display = 'none';
            }
        },
        resize: function (w, option) {
            if (!this.content || !this.active) { return; }
            this.clientWidth = w;
            var pages = this.content.getElementsByClassName(this.id);
            for (var i = 0; i < pages.length; i++) {
                pages[i].style.width = w + 'px';
            }
            //this.content.style.width = (w * pages.length - 1) + 'px';
            //this.container.style.width = (w * pages.length - 1) + 'px';
        },
        setup: function () {
            VK.__currentState = this;
            VK.GameHelper.showAd();
            if (this._alreadySetup) {
                return;
            }
            
            this.id = 'level-menus-' + (new Date().getTime());
            this._alreadySetup = true;
            this.currentCategoryIndex = 0;
            this.entities = [];
            
            this.setupCanvas();
            var mainContainer = VK.DOM.getContainer();
            this.clientWidth = VK.DOM.getCanvasSize().w;
            this.clientHeight = VK.DOM.getCanvasSize().h;

            this.WORLD_WIDTH = this.clientWidth;
            this.WORLD_HEIGHT = this.clientHeight;

            var mainContainer = VK.DOM.getContainer();
            // TODO: WE SHOULD RETHINK THIS AND MAKE IT A SINGLE DOM NODE INSTEAD OF RECREATING IT EVERYTIME!!!!
            this.container = VK.DOM.createDiv(null, 'fill menu-container', mainContainer);
            this.content = VK.DOM.createDiv(null, 'menu-content', this.container);

            this.showDOMBackButton();

            this.isMyLevel = this.categorySet.isMyLevel === true;
          
            // get number of level set for this category
            this.cardsCount = this.categorySet.levelSet.length;


            this.content.style.width = (this.clientWidth * this.cardsCount) + 'px';
            this.content.style.height = this.clientHeight + 'px';

            this.levels = [];
            var calcLeft = -this.clientWidth;
            var frag = document.createDocumentFragment();

            // index level for display i UI
            if (!this.isMyLevel && !this.categorySet.indexed) {
                var counter = 0;
                for (var m = 0; m < this.categorySet.levelSet.length; m++) {
                    var currentLevels = this.categorySet.levelSet[m].levels;
                    for (var k = 0; k < currentLevels.length; k++) {
                        counter++;
                        currentLevels[k].dynamicIndex = counter;
                    }
                }
                this.categorySet.indexed = true;
            }

            for (var cell = 0; cell < this.cardsCount; cell++) {
                var levelsData = this.categorySet.levelSet[cell];

                elem = document.createElement("div");
                elem.className = "menu-cell";
                elem.style.width = this.clientWidth + 'px';
                elem.style.height = this.clientHeight + 'px';
                frag.appendChild(elem);

                calcLeft += this.clientWidth;

                this.levels.push(new VK.Levels({
                    dom: elem, left: calcLeft, width: this.clientWidth,
                    height: this.clientHeight, parent: this, categoryIndex: cell,
                    tabCount: this.cardsCount, levelsData: levelsData,
                    leftAlign: this.isMyLevel, isMyLevel: this.isMyLevel,
                    isDeleteMode: this.isDeleteMode === true,
                    pageCls: this.id
                }));
            }
            this.content.appendChild(frag);

            if (this.isMyLevel) {
                this.showLevelAddButton();
                if (VK.DesignerPROP.showDesignerPropDialog()) {
                    //VK.DesignerPROP.showDesignerProp();
                }
            }
            else {
                this.hideLevelAddButton();
            }


            // Setup Scroller
            this.scroller = new Scroller(this.render.bind(this), {
                scrollingY: false,
                paging: true,
                bouncing: (VK.isWinJS() ? false : true)
            });
            var rect = this.container.getBoundingClientRect();


            // set position to card 2
            //this.scroller.__scrollLeft = this.clientWidth;

            this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);
            this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);

            var mousedown = false;
            var me = this;

            var targetEl = VK.isWinJS() ? /*this.container*/document : document;

            this.onPointerDown(this.container, function (e) { me.onTouchStart(e); });
            this.onPointerMove(targetEl, function (e) { me.onTouchMove(e); });
            this.onPointerCancel(targetEl, function (e) { me.onTouchEnd(e); });
            this.onPointerUp(targetEl, function (e) { me.onTouchEnd(e); });

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
                fixMe(this.container);
            }
            // BEGIN SETUP WORLD
            this.World = new jaws.Rect(0, 0, this.clientWidth, this.clientHeight);
            this.Viewport = new jaws.Viewport({ max_x: this.World.width, max_y: this.World.height });
            this.theme = VK.GameHelper.getThemeById('systheme1');
            this.setupTheme(this.context);

            //this._super();
            // END SETUP WORLD
        },
        onTouchStart: function (e) {
            //console.debug(new Date().getTime());
            e.preventDefault();
            if (!this.isActive()) { return; }
            // Don't react if initial down happens on a form element
            if (e.target.tagName.match(/input|textarea|select/i)) {
                return;
            }
            this.scroller.doTouchStart(e.touches ? e.touches : [{
                pageX: e.pageX,
                pageY: e.pageY
            }], e.timeStamp);

            this.__mousedown = true;
        },
        onTouchMove: function (e) {
            e.preventDefault();
            if (!this.isActive()) { return; }
            if (!this.__mousedown) {
                return;
            }
            this.scroller.doTouchMove(e.touches ? e.touches : [{
                pageX: e.pageX,
                pageY: e.pageY
            }], e.timeStamp);

            this.__mousedown = true;
        },
        onTouchEnd: function (e) {
            e.preventDefault();
            if (!this.isActive()) { return; }
            if (!this.__mousedown) {
                return;
            }
            this.scroller.doTouchEnd(e.timeStamp);
            this.__mousedown = false;
        },
        render: function (left, top, zoom) {
            if (isNaN(top)) {
                top = 0;
            }
            if (this.isMyLevel) {
                // only calc for 0level creator ????
                var levels = this.levels;
                var clientWidth = this.clientWidth;

                var len = levels.length - 1;
                for (var i = len; i >= 0; i--) {
                    var levelsLeft = levels[i].left;
                    if (left >= levelsLeft && left <= (clientWidth + levelsLeft)) {
                        this.currentCategoryIndex = i;
                        break;
                    }
                }
                //console.debug('this.currentCategoryIndex: ' + this.currentCategoryIndex);
            }

            render(left, top, zoom, this.content);
        },
        update: function (time) {
            //if (!this.b2World) { return; }
            //this.b2World.Step(VK.Box2D.TIMESTEP, VK.Box2D.VELOCITY_ITERATIONS, VK.Box2D.POSITION_ITERATIONS); //performs a time step in the box2d simulation
            //this.b2World.ClearForces(); //used to clear the forces after performing the time step
            //for (var i = 0; i < this.entities.length; i++) {
            //    var entity = this.entities[i];
            //    if (entity.isActive()) {
            //        entity.update();
            //    }
            //}
        },
        draw: function (ctx, timeDelta, time) {
            jaws.clear();
            var me = this;

            if (this.m__gradient) {
                this.context.fillStyle = this.m__gradient
                this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            }

            this.Viewport.apply(function () {
                var backgrounds = me.__backgrounds;

                if (backgrounds) {
                    for (var m = 0; m < backgrounds.length; m++) {
                        backgrounds[m].draw(ctx);
                    }
                }
                //for (var i = 0; i < me.entities.length; i++) {
                //    var e = me.entities[i];
                //    e.draw(ctx);
                //}
            });
        }
    });

    //// RENDER HELPER METHOD
    var render = (function (global) {

        var docStyle = document.documentElement.style;

        var engine;
        if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
            engine = 'presto';
        } else if ('MozAppearance' in docStyle) {
            engine = 'gecko';
        } else if ('WebkitAppearance' in docStyle) {
            engine = 'webkit';
        } else if (typeof navigator.cpuClass === 'string') {
            engine = 'trident';
        }

        var vendorPrefix = {
            trident: 'ms',
            gecko: 'Moz',
            webkit: 'Webkit',
            presto: 'O'
        }[engine];

        var helperElem = document.createElement("div");
        var undef;

        var perspectiveProperty = vendorPrefix + "Perspective";
        var transformProperty = vendorPrefix + "Transform";

        if (helperElem.style[perspectiveProperty] !== undef) {

            return function (left, top, zoom, content) {
                if (content) {
                    content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
                }
            };

        } else if (helperElem.style[transformProperty] !== undef) {

            return function (left, top, zoom, content) {
                if (!content) { return; }
                content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
            };

        } else {

            return function (left, top, zoom, content) {
                if (!content) { return;}
                content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
                content.style.marginTop = top ? (-top / zoom) + 'px' : '';
                content.style.zoom = zoom || '';
            };

        }
    })(this);

})();