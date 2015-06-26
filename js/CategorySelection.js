/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

; (function () {
    
    VK.Category = Class.extend({
        id: (new Date()).getTime(),
        dom: null,
        levelSetIndex: 0, // index of levels category in VK.GameData
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        isMyLevel: function () {
            return this.category.isMyLevel === true;
        },
        isLock: function () {
            if (this.category && this.category.isAd) {
                return false;
            }
            if (this.levelSetIndex == 0) {
                return false;
            }

            //if (VK.AddSupported === true && !this.category.unlock && this.levelSetIndex > 0 && !this.isMyLevel()) {
            //    return true;
            //}

            //if (VK.GameHelper.isTrialLicense() && !this.category.unlock && this.levelSetIndex > 0 && !this.isMyLevel()) {
            //    return true;
            //}
            if (localStorage.getItem(this.category.id)) {
                return false;
            }
            return !this.category.unlock;
        },
        setUnlock: function () {
            this.category.unlock = true;
            localStorage.setItem(this.category.id, 1);

            this.setUnlock2();
        },
        setUnlock2: function () {
            if (/*(!VK.GameHelper.isTrialLicense() || this.isMyLevel() || VK.AddSupported === true) &&*/ this.category.unlock && this.dom) {
                var lockDiv = this.dom.getElementsByClassName('category-item-underlay')[0];
                if (lockDiv) {
                    lockDiv.style.display = 'none';
                }
            }
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
                    if (e.target.getAttribute('levelSetIndex') && this.isLock() === false) {
                        //var levelSetIndex = parseInt(e.target.getAttribute('levelSetIndex'));
                        this.parent.setCurrentCategorySet(this.category);
                    }
                }
                pointerDown = false;
            }.bind(this));

        },
         createLock: function (sb) {
            sb.push(
                [
                     '<table class="fill" border=0 cellpadding=0 cellspacing=0 style="background-color:black; opacity:.5;">',
                        '<tr>',
                            '<td valign=middle align=center>',
                            '</td>',
                        '</tr>',
                    '</table>'
                ]
            );
        },
        getScreenshot: function () {
            try {
                return this.category.levelSet[0].levels[0].worldDef[VK.CONSTANT.DESIGN_LEVEL_DEF.SCREENSHOT];
            }
            catch (e) { }
            return null;
        },
        init: function (options) {
            this.set(options);
            
            var screenshot = this.getScreenshot();

            var sb = ['<table border=0 cellpadding=0 cellspacing=0 style="width:' + this.width + 'px; height:' + this.height + 'px; border:0px solid red;">'];
            if (this.category.clsText) {
                this.generateBar(sb, 'top', this.category.name, this.category.clsText);
            }
            else {
                this.generateBar(sb, 'top', this.category.name);
            }
            sb.push('<tr>');
            sb.push('<td valign=middle align=center class="category-item-td">');
                sb.push('<div class="category-item-wrapper">');
                    sb.push('<div class="category-item" levelSetIndex="' + this.levelSetIndex + '"><img class="category-item-screen screenshot-' + this.levelSetIndex + '" levelSetIndex="' + this.levelSetIndex + '"/></div>');
                    if (this.isLock() === true) {
                        sb.push('<div class="category-item-underlay category-item" levelSetIndex="' + this.levelSetIndex + '">');
                        sb.push('<img src="' + VK.APPLICATION_ROOT + 'assets/ingame/lock.png" style="top:80px; position:relative;"/>');
                        sb.push('</div>');
                    }
                sb.push('</div>');
            sb.push('</td>');
            sb.push('</tr>');
            var clsText = '';
            if (this.category.clsText) { clsText = this.category.clsText; }
            this.generateBar(sb, 'bottom', this.category.description, 'category-selection-description ' + clsText, true);
            sb.push('</table>');
            
            VK.DOM.setInnerHTML(this.dom, sb.join(''));

            if (this.category.isAd !== true) {
                this.setupEvents();
            }
            if (screenshot) {
                this.dom.getElementsByClassName("screenshot-" + this.levelSetIndex)[0].src = screenshot;
            }
            else if (this.category.isMyLevel===true) {
                this.dom.getElementsByClassName("screenshot-" + this.levelSetIndex)[0].src = this.category.screenshot;
            }
            else {
                this.dom.getElementsByClassName("screenshot-" + this.levelSetIndex)[0].style.display = 'none';
            }

            //if (this.category.isAd) {
            //    var adDiv = document.getElementById('myAd2');
            //    if (adDiv) {
            //        this.dom.getElementsByClassName("category-item-wrapper")[0].appendChild(adDiv);
            //    }
            //}


            PubSub.subscribe(VK.CONSTANT.PUBSUB.LEVEL_COMPLETE, this, function () {
                this.setUnlock();
            });

            PubSub.subscribe(VK.CONSTANT.PUBSUB.TRIAL_CONVERSION_SUCCESS, this, function () {
                this.setUnlock2();
            });
        },
        generateBar: function (sb, type, title, cls, addBr) {
            if( !title ) {
                title = '&nbsp;';
            }
            if( !cls ) {
                cls = ''
            }
            sb.push('<tr>');
            if(type == 'bottom') {
                sb.push('<td valign=top align=center id="' + type + this.id + '" style="margin-top:6px;" class="text-shadow2">');
            }
            else {
                sb.push('<td valign=bottom align=center id="' + type + this.id + '" style="margin-bottom:6px;" class="text-shadow2">');
            }
            if (title) {
                if (addBr) {
                    sb.push('<div style="height:12px;"></div>');
                }
                sb.push('<label class="'+ cls+ '">' + title + '</label>');
            }
            sb.push('</td>');
            sb.push('</tr>');
        }
    });

    VK.CategorySelection = VK.GameStateBase.extend({
        clientWidth: 0,
        clientHeight: 0,
        cardsCount: 0,
        __mousedown: false,
        WALL_PADDING: 20,
        entities: null,
        dolerp: false,
        active: true,
        setCurrentCategorySet: function(category) {
            this.hide();
            VK.GameHelper.setCurrentCategorySet(category, function callback_back() {
                this.show();
                VK.GameHelper.switchGameState(this);
                VK.DOM.Wait.hide();
            }.bind(this));
        },
        isActive: function () {
            return this.active;
        },
        hide: function () {
            this.active = false;
            //$(this.container).fadeOut('slow');
            this.container.style.display = 'none';
            this.hideDOMBackButton();
        },
        show: function () {
            this.active = true;
            this.container.style.display = '';
            this.showDOMBackButton();
        },
//        destroy: function () {
//            this.clearWorld();
//            this.removeListeners();
//            this.container.style.display = 'none';
//            this.container = null;
//            this.b2World = null;
//            this.content = null;
//        },
        setupB2D: function () {
            //this.b2World = new b2World(
            //// 0.001 to simulate wind
            //    new b2Vec2(0.0, 10.0)   //gravity
            //    , true                 //allow sleep
            //);

            //var debugDraw = new b2DebugDraw();
            //// hack clear method...bug!!! in rendering
            //debugDraw.m_sprite.graphics.clear = function () { };
            //debugDraw.SetSprite(jaws.context);
            //debugDraw.SetDrawScale(VK.Box2D.WORLD_SCALE);
            //debugDraw.SetFillAlpha(0.5);
            //debugDraw.SetLineThickness(1.0);
            //debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            //this.b2World.SetDebugDraw(debugDraw);

            //// NOTE: box2 create rect w/2
            //VK.Box2dUtils.generateWall_TOP(this.b2World, this.clientWidth, this.WALL_PADDING / 2, 0, 0); // ceil wall
            //VK.Box2dUtils.generateWall_LEFT(this.b2World, this.WALL_PADDING / 2, this.clientHeight, this.WALL_PADDING / 2, this.clientHeight - this.WALL_PADDING / 2); // left wall
            //VK.Box2dUtils.generateWall_RIGHT(this.b2World, this.WALL_PADDING / 2, this.clientHeight, this.clientWidth - this.WALL_PADDING / 2, 0); // right wall

            //VK.Box2dUtils.generateWall_BOTTOM(this.b2World, this.clientWidth, this.WALL_PADDING / 2, 0, this.clientHeight - this.WALL_PADDING / 2); // groound wall
        },
        addEntity: function (entity) {
            this.entities.push(entity);
        },
        loadGameData: function () {

        },
        setActiveCard: function (levelSetIndex, animate) {
            var card = this.levels[levelSetIndex];
            var me = this;
            // defer for 300 ms, make animation maybe look better???
            //window.setTimeout(function () {
            me.scroller.scrollTo(card.left, 0, animate !== undefined ? animate : false);
            //}, 300);
        },
        init: function (options) {
            this.set(options);
        },
        setup: function () {
            if (this._alreadySetup) {
                //var trial_key = 'try_trial_conversion_in_category';
                //if (VK.GameHelper.isTrialLicense() && !localStorage.getItem(trial_key)) {
                //    VK.Howto.showBuyDialog(function () {
                //        VK.GameHelper.doTrialConversion();
                //    });
                //    localStorage.setItem(trial_key, 'y');
                //}
                return;
            }
            this._alreadySetup = true;

            this.entities = [];
            this.setupCanvas();
            var mainContainer = VK.DOM.getContainer();
            this.clientWidth = VK.DOM.getCanvasSize().w;
            this.clientHeight = VK.DOM.getCanvasSize().h;

            this.WORLD_WIDTH = this.clientWidth;
            this.WORLD_HEIGHT = this.clientHeight;
            // TODO: WE SHOULD RETHINK THIS AND MAKE IT A SINGLE DOM NODE INSTEAD OF RECREATING IT EVERYTIME!!!!
            this.container = VK.DOM.createDiv(null, 'fill menu-container', mainContainer);
            this.showBuyFullVersionButton(this.container);
            this.content = VK.DOM.createDiv(null, 'menu-content', this.container);

            // get number of level set for this category
            this.cardsCount = this.categories.length;
            
            this.content.style.height = this.clientHeight + 'px';
            
            var frag = document.createDocumentFragment();

            var innerPadding = 100;
            var categoryWidth = 400;
            // calc outer paddings
            var outerPadding = this.clientWidth/2 - categoryWidth / 2;

            var create = function(id, cls, w, h) {
                elem = document.createElement("div");
                elem.className = cls;
                elem.style.width = w + 'px';
                elem.style.height = h + 'px';
                frag.appendChild(elem);
                return elem;
            };

            var contentWidth = outerPadding;
            create('', "category-cell-padding2", outerPadding, this.clientHeight);
            
            for (var cell = 0; cell < this.cardsCount; cell++) {
                var category = this.categories[cell];
                
                contentWidth += categoryWidth;
                var elem = create('', "category-cell", categoryWidth, this.clientHeight);

                new VK.Category({ dom: elem, left: contentWidth, width: categoryWidth, height: this.clientHeight, parent: this, levelSetIndex: cell, tabCount: this.cardsCount, category: category });
                
                if( cell + 1 == this.cardsCount ) {
                    create('', "category-cell-padding2", outerPadding, this.clientHeight);
                    contentWidth += outerPadding;
                }
                else {
                   create('', "category-cell-padding2", innerPadding, this.clientHeight);
                    contentWidth += innerPadding;
                }
                frag.appendChild(elem);
            }

            this.content.style.width = (contentWidth) + 'px';


            this.content.appendChild(frag);
            // Setup Scroller
            this.scroller = new Scroller(this.render.bind(this), {
                scrollingY: false,
                bouncing: (VK.isWinJS() ? false : true)
            });
            var rect = this.container.getBoundingClientRect();

            this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);
            this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);

            var mousedown = false;
            var me = this;

            this.onPointerDown(this.container, function (e) { me.onTouchStart(e); });

            var targetEl = VK.isWinJS() ? /*this.container*/document : document;

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
            //this._super();
            // END SETUP WORLD



            //this.addEntity(new VK.InGame.Ballon2({ b2World: this.b2World, x: 190, y: 100, gravity: -10.01, breakable:false }));
            //this.addEntity(new VK.InGame.Ballon2({ b2World: this.b2World, x: 10, y: 200, gravity: -10.01, breakable:false}));
            //this.addEntity(new VK.InGame.Ballon2({ b2World: this.b2World, x: 290, y: 300, gravity: -10.01, breakable:false }));
            //this.addEntity(new VK.InGame.Ballon2({ b2World: this.b2World, x: 390, y: 400, gravity: -10.02, breakable:false}));
            //this.addEntity(new VK.InGame.Ballon2({ b2World: this.b2World, x: 90, y: 500, gravity: -10.01, breakable:false }));

            this.theme = VK.GameHelper.getThemeById('systheme1');
            this.setupTheme(this.context);
            this.show();
        },
        onTouchStart: function (e) {
            //console.log('1 onTouchStart ' + new Date().getTime());
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
            //console.log('1 onTouchMove ' + new Date().getTime());
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
            //console.log('left: ' + left + ' top: ' + top);
            if (isNaN(top)) {
                top = 0;
            }
            render(left, top, zoom, this.content);
        },
        update: function (time) {
            if (!this.b2World) { return; }
            this.b2World.Step(VK.Box2D.TIMESTEP, VK.Box2D.VELOCITY_ITERATIONS, VK.Box2D.POSITION_ITERATIONS); //performs a time step in the box2d simulation
            this.b2World.ClearForces(); //used to clear the forces after performing the time step
            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];
                if (entity.isActive()) {
                    entity.update();
                }
            }
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
                for (var i = 0; i < me.entities.length; i++) {
                    var e = me.entities[i];
                    e.draw(ctx);
                }
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
                content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
            };

        } else if (helperElem.style[transformProperty] !== undef) {

            return function (left, top, zoom, content) {
                content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
            };

        } else {

            return function (left, top, zoom, content) {
                content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
                content.style.marginTop = top ? (-top / zoom) + 'px' : '';
                content.style.zoom = zoom || '';
            };

        }
    })(this);

})();