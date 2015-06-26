/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

if (typeof VK === 'undefined') {
    VK = {};
};

// BUILD PROCESS INJECTED
VK.DEBUG_MODE = "{{DEBUG_MODE}}";
VK.COMPILED = "{{COMPILED}}";
VK.BUST_CACHE = "{{BUST_CACHE}}";
VK.WEB_SHARED_MODE = "{{WEB_SHARED_MODE}}";
// END BUILD STUFF
VK.IsSharedMode = function () {
    return VK.WEB_SHARED_MODE === "Y";
};
VK.isWinJS = function () {
    return typeof (window['WinJS']) !== 'undefined';
};
VK.isDebugMode = function () {
    //return false;
    var debugMode = VK.DEBUG_MODE !== "N";

    var qs_debug_flag = VK.GameHelper.getUrlParameterByName('d');
    // give chance to override
    if (qs_debug_flag == 'y') {
        debugMode = true;
    }
    if (qs_debug_flag == 'n') {
        // set private scope variable
        debugMode = false;
    }
    if (VK.isWinJS()) {
        debugMode = false;
    }
    return debugMode;
};
VK.isCompiled = function () {
    return VK.COMPILED === "Y";
};
VK.isDef = function (o) {
    return o !== undefined;
};
VK.isNotDefOrNull = function (o) {
    return o === undefined || o === null;
};
VK.isFunction = function (func) {
    return typeof func == "function";
};
VK.importExternal = function (n, scope) {
    scope = scope || window;
    if (VK.isDef(scope[n])) {
        return scope[n];
    }
};

if (!Array.prototype.insert) {
    Array.prototype.insert = function (index, item) {
        this.splice(index, 0, item);
    };
};

if (!Array.prototype.random) {
    Array.prototype.random = function () {
        return this[Math.floor(Math.random() * this.length)];
    };
};

/* Simple JavaScript Inheritance
* By John Resig http://ejohn.org/
* MIT Licensed.
*/
// Inspired by base2 and Prototype
(function () {
    var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)

    window['Class'] = function () { };

    // Create a new Class that inherits from this class
    window['Class'].extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function (name, fn) {
            return function () {
                var tmp = this._super;

                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = _super[name];

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);
                this._super = tmp;

                return ret;
            };
        })(name, prop[name]) :
        prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) {
                if( this.initBefore ) {
                    this.initBefore.apply(this, arguments);
                }
                this.init.apply(this, arguments);
                if( this.initAfter ) {
                    this.initAfter.apply(this, arguments);
                }
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        Class.prototype.addListener = function (type, dom, handler) {
            if (!this.events) {
                this.events = [];
            }
            this.events.push({type:type, dom:dom, handler:handler});
            switch(type) {
                case VK.DOM.Event.Type.onPointerDown:
                    VK.DOM.Event.onPointerDown(dom, handler);
                    break;
                case VK.DOM.Event.Type.onPointerMove:
                    VK.DOM.Event.onPointerMove(dom, handler);
                    break;
                case VK.DOM.Event.Type.onPointerCancel:
                    VK.DOM.Event.onPointerCancel(dom, handler);
                    break;
                case VK.DOM.Event.Type.onPointerUp:
                    VK.DOM.Event.onPointerUp(dom, handler);
                    break;
            }
        };
        Class.prototype.removeListeners = function () {
            if (this.events) {
                for(var i=0; i < this.events.length; i++) {
                    VK.DOM.Event.removeEventOnPointer(this.events[i].type, this.events[i].dom, this.events[i].handler);
                    this.events[i].dom = null;
                    this.events[i].handler = null;
                    this.events[i] = null;
                }
                this.events = null;
            }
        };
        Class.prototype.set = function (options) {
            if (options) {
                for (var key in options) {
                    this[key] = options[key];
                }
            }
        };

        return Class;
    };
})();
if (typeof Object.create !== 'function') {
	/**
		* Prototypal Inheritance Create Helper
		* @param {Object} Object
		* @example
		* // declare oldObject
		* oldObject = new Object();
		* // make some crazy stuff with oldObject (adding functions, etc...)
		* ...
		* ...
		*
		* // make newObject inherits from oldObject
		* newObject = Object.create(oldObject);
		*/
	Object.create = function(o) {
		function _fn() {};
		_fn.prototype = o;
		return new _fn();
	};
};
if (!Function.prototype.bind) {
    Function.prototype.bind = function() {
		var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift();
		return function() {
			return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}

if (!String.format) {
    String.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    }
}

/**
* Executes a function as soon as the interpreter is idle (stack empty).
* @returns id that can be used to clear the deferred function using clearTimeout
* @example
*
*   // execute myFunc() when the stack is empty, with 'myArgument' as parameter
*   myFunc.defer('myArgument');
*
*/
if (!Function.prototype.defer) {

    Function.prototype.defer = function () {
        var fn = this, args = Array.prototype.slice.call(arguments);
        return window.setTimeout(function () {
            return fn.apply(fn, args);
        }, 1);
    };

    Function.prototype.defer2 =
      function (n, scope) {
          // Get arguments as array
          var a = [];
          for (var i = 2; i < arguments.length; i++)
              a.push(arguments[i]);
          var that = this;
          window.setTimeout(function () { return that.apply(scope, a); }, n);
      };
}
/**
	* add a clamp fn to the Number object
	* @extends Number
	* @return {Number} clamped value
	*/
Number.prototype.clamp = function(low, high) {
	return this < low ? low : this > high ? high : this;
};

/**
	* return a random between min, max
	* @param {Number} min minimum value.
	* @param {Number} max maximum value.
	* @extends Number
	* @return {Number} random value
	*/
Number.prototype.random = function(min, max) {
	return (~~(Math.random() * (max - min + 1)) + min);
};

/**
	* round a value to the specified number of digit
	* @param {Number} [num="Object value"] value to be rounded.
	* @param {Number} dec number of decimal digit to be rounded to.
	* @extends Number
	* @return {Number} rounded value
	* @example
	* // round a specific value to 2 digits
	* Number.prototype.round (10.33333, 2); // return 10.33
	* // round a float value to 4 digits
	* num = 10.3333333
	* num.round(4); // return 10.3333
	*/
Number.prototype.round = function() {
	// if only one argument use the object value
	var num = (arguments.length == 1) ? this : arguments[0];
	var powres = Math.pow(10, arguments[1] || arguments[0]);
	return (Math.round(num * powres) / powres);
};


Math.normalRelativeAngle = function (angle) {
    //http://box2d.org/forum/viewtopic.php?f=5&t=4726
    var PI = Math.PI;
    var TWO_PI = 2 * PI;
    return (angle %= TWO_PI) >= 0 ? (angle < PI) ? angle : angle - TWO_PI : (angle >= -PI) ? angle : angle + TWO_PI;
};

if (!VK.isDef(VK.randomMax)) {
    VK.randomMax = function (max) {
        return Math.min(Math.round(Math.random() * max), max - 1);
    };
};

if (!VK.isDef(VK.ns)) {
    VK.ns = function (namespace, scope) {
        var object = scope, tokens = namespace.split("."), token;
        while (tokens.length > 0) {
            token = tokens.shift();

            if (typeof object[token] === "undefined") {
                object[token] = {};
            }

            object = object[token];
        }

        return object;
    };
};

// Create VK namespace
if (!VK.isDef(VK.InGame)) {
    VK.InGame = {};
};
VK.InGame.Wall = {};

if (!VK.isDef(VK.Block)) {
    VK.Block = {};
}
if (!VK.isDef(VK.Wall)) {
    VK.Wall = {};
}
VK.InGame.LIFE_COUNT = 5;
VK.InGame.UNLIMITED_LIFE = false;

// do requestAnimFrame
var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */callback, /* DOMElement */element) {
        window.setTimeout(callback, 16.666);
    };
})();

VK.GameStateBase = Class.extend({
    designEntities: null,   // entities in design mode
    entities: null,
    // list of enemies to kill before winning current level
    enemies: null,
    player: null,
    enemiesTotal: 0,
    lifeCount: VK.InGame.LIFE_COUNT,
    stars: null,
    starsTotal: 0,
    _isDesignMode: false,
    _isDesignModeRunning: false,
    _execOnUpdate: null,
    _isUnlimitedLife: VK.InGame.UNLIMITED_LIFE,
    theme: null,
    // ran out of player in level?
    isLifeDONE: function () { return false; },
    isUnlimitedLife: function () {
        return this._isUnlimitedLife;
    },
    setUnlimitedLife: function (v) {
        this._isUnlimitedLife = v;
    },
    setLifeCounter: function (i) {
        this.lifeCount = i;
    },
    getLifeCounter: function () {
        return this.lifeCount;
    },
    clearBackground: function () {
        this.__backgrounds = [];
    },
    resize: function () { },
    execOnUpdate: function (func) {
        if (!this._execOnUpdate) {
            this._execOnUpdate = [];
        }
        this._execOnUpdate.push(func);
    },
    _b2BodiesScheduledForRemoval: null,
    addBodiesScheduledForRemoval: function (b2Body) {
        if (!this._b2BodiesScheduledForRemoval) {
            this._b2BodiesScheduledForRemoval = [];
        }
        this._b2BodiesScheduledForRemoval.push(b2Body);
    },
    addBackground: function (bg) {
        if (!this.__backgrounds) {
            this.clearBackground();
        }
        bg.world_width = this.getWorldWidth();
        bg.world_height = this.getWorldHeight();
        this.__backgrounds.push(bg);
    },
    setupCanvas: function () {
        this.canvas = VK.DOM.getCanvas();
        this.context = this.canvas.getContext("2d");
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
    },
    setThemeGradient: function () {
        var gradient = this.getTheme().gradient;
        this.m__gradient = this.context.createLinearGradient(0, 0, 0, this.canvasHeight);
        this.m__gradient.addColorStop(0, gradient[0]);
        this.m__gradient.addColorStop(1, gradient[1]);
    },
    setupTheme: function (ctx) {
        var theme = this.getTheme();
        this.m__gradient = null;
        if (theme.gradient) {
            this.setThemeGradient();
        }
        this.clearBackground();
        if (theme.bg) {
            for (var i = 0; i < theme.bg.length; i++) {
                this.addBackground(new VK.InGame.BACKGROUND({ theme: theme.bg[i], WORLD_WIDTH: this.getWorldWidth(), WORLD_HEIGHT: this.getWorldHeight()}));
            }
        }
    },
    getTheme: function () {
        return this.theme ? this.theme : VK.GameHelper.getThemeById('theme1');
    },
    setTheme: function (themeId) {
        this.theme = VK.GameHelper.getThemeById(themeId);
    },
    setWorldWidth: function (w) {
        // set world width if bigger than canvas view port
        if (w > VK.DOM.getCanvasSize().w) {
            this.WORLD_WIDTH = w;
        }
    },
    getWorldWidth: function () {
        return this.WORLD_WIDTH;
    },
    setWorldHeight: function (h) {
        if (h > VK.DOM.getCanvasSize().h) {
            this.WORLD_HEIGHT = h;
        }
    },
    getWorldHeight: function (h) {
        return this.WORLD_HEIGHT;
    },
    getEnemiesTotal: function () {
        // number of enemies in level
        return this.enemiesTotal;
    },
    getStarsTotal: function () {
        // number of stars in level
        return this.starsTotal;
    },
    clearTimers: function () {
        if (this.timers && this.timers.length) {
            for (var i = 0; i < this.timers.length; i++) {
                var t = this.timers[i];
                if (t) {
                    t.cancel();
                }
            }
        }
        this.timers = [];
    },
    isLevelComplete: function () {
        return this.m__levelIsComplete === true;
    },
    resetVariables: function () {
        this.entities = [];
        this.designEntities = [];
        // TODO: change this to counting instead keep in array
        this.resetVariablesBasic();
    },
    resetVariablesBasic: function () {
        this.player = null;
        this.enemies = [];
        this.stars = [];
        this.score = 0;
        this.starsTotal = 0;
        this.lifeCount = VK.InGame.LIFE_COUNT;
        this.enemiesTotal = 0;
        this.clearTimers();
        this._execOnUpdate = [];
        this.m__levelIsComplete = false;
    },
    init: function (options) {
        this.set(options);
        this.resetVariables();
    },
    toDataURL: function (w, h) {
        var imageType = "image/png";
        if (w && h) {
            // scale image to w, h
            var canvas = VK.Canvas.renderToCanvas(w, h, function (ctx) {
                ctx.drawImage(this.canvas, 0, 0, w, h);
            } .bind(this));
            return canvas.toDataURL(imageType);
        }
        return this.canvas.toDataURL(imageType);
    },
    drawFps: function (ctx) {
        if (!VK.isDebugMode()) { return; }
        if (jaws.game_loop.fps) {
            if (!this.__debug_fps) {
                this.__debug_fps = document.getElementById('fps');
            }
            var fps = this.__debug_fps;

            if (fps) {
                VK.DOM.setInnerHTML(fps, "fps: " + jaws.game_loop.fps);
            }
            //ctx.fillStyle = "red";
            //ctx.font = '12px Helvetica';
            //ctx.fillText("fps: " + jaws.game_loop.fps, 5, 12);
        }
    },
    setIsDesignMode: function (v, testrunning) {
        this._isDesignMode = v;
        // we are in design mode and running simulation
        if (testrunning !== undefined) {
            this._isDesignModeRunning = testrunning;
        }
    },
    isDesignModeRunning: function () {
        return this._isDesignModeRunning;
    },
    isDesignMode: function () {
        return this._isDesignMode;
    },
    isDesigning: function () {
        return this.isDesignMode() == true || this.isDesignModeRunning() == true;
    },
    destroyEntities: function (entities) {
        var len = entities.length;
        for (var i = len - 1; i >= 0; i--) {
            try {
                if (entities[i]) {
                    entities[i].destroy();
                }
            }
            catch (e) {
                debugger
            }
        }
    },
    getEntities: function () {
        if (this.isDesignMode()) {
            return this.designEntities;
        }
        return this.entities;
    },
    setEntities: function (v) {
        if (this.isDesignMode()) {
            this.designEntities = v;
        }
        else {
            this.entities = v;
        }
    },
    addEntity: function (entity) {
        // track enemies for level
        if (!entity) {
            debugger
            throw new Error('entity not valid!');
        }
        if (entity.isEnemy == true) {
            if (!this.enemies) {
                this.enemies = [];
            }
            this.enemies.push(entity);
            // track enemies count for level
            this.enemiesTotal += 1;
        }
        // track star count for level
        if (entity.getIsStar()) {
            this.starsTotal += 1;
        }

        var entities = this.getEntities();
        var length = entities.length;

        if (length && VK.isDef(entity.zIndex)) {
            //PUT IN RENDERING Z-INDEX ORDER
            var temp;
            var success = false;
            for (var i = 0; i < length; i++) {
                temp = entities[i];
                if (temp && (typeof temp.zIndex === 'undefined' || entity.zIndex <= temp.zIndex)) {
                    // insert i
                    entities.insert(i, entity);
                    success = true;
                    break;
                }
            }
            if (!success) {
                entities.unshift(entity);
            }
        }
        else {
            entities.push(entity);
        }
        // is player entity
        if (entity.isPlayer()) {
            this.player = entity;
        }
    },
    isActive: function () {
        return jaws.game_state == this;
    },
    fireBeginContactEvent: function (contact, fixture, contactBody) {
        if (fixture) {
            var b = fixture.GetBody();
            if (b) {
                var userData = b.GetUserData();
                // SKIP VK.CONSTANT.ROPE PERF!!!
                if (userData && userData.Name != VK.CONSTANT.ROPE && userData.Entity) {
                    userData.Entity.beginContact(contact, b);
                }
            }
        }
    },
    beginContact: function (contact) {
        if (contact) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            this.fireBeginContactEvent(contact, fixtureA, fixtureB ? fixtureB.GetBody() : null);
            this.fireBeginContactEvent(contact, fixtureB, fixtureA ? fixtureA.GetBody() : null);
        }
    },
    fireEndContactEvent: function (contact, fixture, contactBody) {
        if (fixture) {
            var b = fixture.GetBody();
            if (b) {
                var userData = b.GetUserData();
                // SKIP VK.CONSTANT.ROPE PERF!!!
                if (userData && userData.Name != VK.CONSTANT.ROPE && userData.Entity) {
                    userData.Entity.endContact(contact, contactBody);
                }
            }
        }
    },
    endContact: function (contact) {
        if (contact) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            if (fixtureA) {
                this.fireEndContactEvent(contact, fixtureA, fixtureB ? fixtureB.GetBody() : null);
            }
            if (fixtureB) {
                this.fireEndContactEvent(contact, fixtureB, fixtureA ? fixtureA.GetBody() : null);
            }
        }
    },
    preSolve: function (contact, oldManifold) { },
    postSolve: function (contact, impulse) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var a_body = fixtureA.GetBody();
        var b_body = fixtureB.GetBody();
        var userDataA = a_body.GetUserData();
        var userDataB = b_body.GetUserData();

        if (userDataA && userDataA.Name != VK.CONSTANT.ROPE && userDataA.Entity && userDataA.Entity.postSolve) {
            userDataA.Entity.postSolve(contact, impulse, b_body);
        }
        if (userDataB && userDataB.Name != VK.CONSTANT.ROPE && userDataB.Entity && userDataB.Entity.postSolve) {
            userDataB.Entity.postSolve(contact, impulse, a_body);
        }
    },
    setupB2D: function () { },
    setupWorldWalls: function () { },
    setup: function () {
        this.setupB2D();
        this.setupWorldWalls();
        var ContactListener = function () { };
        ContactListener.prototype.BeginContact = this.beginContact.bind(this);
        ContactListener.prototype.EndContact = this.endContact.bind(this);
        ContactListener.prototype.PreSolve = this.preSolve.bind(this);
        ContactListener.prototype.PostSolve = this.postSolve.bind(this);
        this.b2World.SetContactListener(new ContactListener());
    },
    // destroy all the bodies and joins and null out entities
    clearWorld: function (destroy) {
        //if (this.context) {
        //    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //}
        var entities = this.getEntities();
        var world = this.b2World;
        if (entities && entities.length) {
            var len = entities.length;
            for (var i = len - 1; i >= 0; i--) {
                var entity = entities[i];
                if (entity) {
                    if (entity.b2Body) {
                        world.DestroyBody(entity.b2Body);
                    }
                    if (entity.b2Joint) {
                        world.DestroyJoint(entity.b2Joint);
                    }
                }
                entity = null;
            }
        }
        if (destroy == true) {
            var walls = this.walls;

            if (walls) {
                // destroy wall bodies
                for (var i = 0; i < walls.length; i++) {
                    var w = walls[i];
                    if (w.b2Body) {
                        world.DestroyBody(w.b2Body);
                    }
                    w = null;
                }
            }
            this.walls = null;
        }
        this.setEntities(null);
    },
    onPointerDown: function (dom, handler) {
        this.addListener(VK.DOM.Event.Type.onPointerDown, dom, handler);
    },
    onPointerMove: function (dom, handler) {
        this.addListener(VK.DOM.Event.Type.onPointerMove, dom, handler);
    },
    onPointerCancel: function (dom, handler) {
        this.addListener(VK.DOM.Event.Type.onPointerCancel, dom, handler);
    },
    onPointerUp: function (dom, handler) {
        this.addListener(VK.DOM.Event.Type.onPointerUp, dom, handler);
    },
    // hook so we can do something interesting
    before_callback_back: function () { return true; },
    /// DOM BACK BUTTON
    showDOMBackButton: function () {
        // need a callback_back to show back button
        if (this.callback_back && !this.m_DOMBackButton) {
            var container = VK.DOM.getContainer();
            this.m_DOMBackButton = VK.DOM.createDiv(null, 'ingame-back-button', container);
            this.m_DOMBackButton.title = 'go back';
            VK.DOM.Event.onPointerDown(this.m_DOMBackButton, function (e) {
                if (this.callback_back) {
                    VK.DOM.Wait.show();
                    var delay = function () {
                        this.showAd();
                        if (this.before_callback_back()) {
                            this.hide();
                            this.callback_back({ levelId: this.levelId, isNew: this._isNew === true });
                        }
                        else {
                            VK.DOM.Wait.hide();
                        }

                    } .bind(this);

                    delay.defer();
                }
            } .bind(this));
        }
        if (this.m_DOMBackButton) {
            this.m_DOMBackButton.style.display = '';
        }
    },
    showAd: function () {
        VK.GameHelper.showAd();
    },
    hideAd: function () {
        VK.GameHelper.hideAd();
    },
    hideDOMBackButton: function (fade) {
        if (this.m_DOMBackButton) {
            if (fade) {
                $(this.m_DOMBackButton).fadeOut('slow');
            }
            else {
                this.m_DOMBackButton.style.display = 'none';
            }
        }
    },
    showBuyFullVersionButton: function (container) {
        if (/*VK.GameHelper.isTrialLicense()*/ VK.AddSupported === true && !this.m_buyContainer) {
            this.btnBuyId = new Date().getTime();

            var buy_string = [
                '<table width="100%" height="42px;" border="0" style="margin-top:20px;"><tr>',
                    '<td align="center" valign="middle">',
                        '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/buy_game_button1.png" id="buy' + this.btnBuyId + '" width=200 height=40>',
                    '</td>',
                '<tr></table>'
            ].join('');

            this.m_buyContainer = VK.DOM.createDiv(null, '', container);
            var m_buyContainer = this.m_buyContainer;

            VK.DOM.setInnerHTML(this.m_buyContainer, buy_string);

            this.onPointerDown(document.getElementById('buy' + this.btnBuyId), function (e) {
                VK.DOM.PreventDefaultManipulationAndMouseEvent(e);
                VK.GameHelper.doTrialConversion(function () {
                    m_buyContainer.style.display = 'none';
                });
            }.bind(this));

            PubSub.subscribe(VK.CONSTANT.PUBSUB.TRIAL_CONVERSION_SUCCESS, this, function (options) {
                if (this.m_buyContainer) {
                    this.m_buyContainer.style.display = 'none';
                }
            }.bind(this));
        }
    }
});


VK.GameState_SELECTION = VK.GameStateBase.extend({
    draw: function (ctx, timeDelta, time) {
        if (this.active) {
            jaws.clear();
            var me = this;
            if (this.gradient) {
                ctx.fillStyle = this.gradient;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
                    if (e.fade) {
                        e.fade();
                    }
                    if (e.move) {
                        e.move();
                    }
                    e.draw(ctx);
                }
            });
            this.lerp(ctx, (time - this.nextLerpTime) % this.nextLerpTime, this.lerpTime);

            this.drawFps(ctx);
        }
    },
    gradient: null,
    lerpTime: 10000,        // time taken to fade sky colors
    nextLerpTime: 60000,    // after fading, how much time to wait to fade colors again.
    colors: [
                [0x00, 0x3f, 0x7f, //0x00, 0x00, 0x3f,
                    0x00, 0x3f, 0x7f,
                    0x1f, 0x5f, 0xc0,
                    0x3f, 0xa0, 0xff]

                , [0x00, 0x3f, 0x7f,
                    0xa0, 0x5f, 0x7f,
                    0xff, 0x90, 0xe0,
                    0xff, 0x90, 0x00]

                , [0x00, 0x3f, 0x7f, //0x00, 0x00, 0x00,
                    0x00, 0x2f, 0x7f,
                    0x00, 0x28, 0x50,
                    0x00, 0x1f, 0x3f]

                , [0x00, 0x3f, 0x7f, //0x1f, 0x00, 0x5f,
                    0x3f, 0x2f, 0xa0,
                    0xa0, 0x1f, 0x1f,
                    0xff, 0x7f, 0x00]
    ],

    ambients: [1, .35, .05, .5],    // ambient intensities for each sky color
    lerpindex: 0,                   // start with this sky index.

    /**
    * fade sky colors
    * @param time current time
    * @param last how much time to take fading colors
    */
    lerp: function (ctx, time, last) {
        this.gradient = ctx.createLinearGradient(0, 0, 0, this.WORLD_HEIGHT);

        var i0 = this.lerpindex % this.colors.length;
        var i1 = (this.lerpindex + 1) % this.colors.length;

        for (var i = 0; i < 4; i++) {
            var rgb = 'rgb(';
            for (var j = 0; j < 3; j++) {
                rgb += Math.floor((this.colors[i1][i * 3 + j] - this.colors[i0][i * 3 + j]) * time / last + this.colors[i0][i * 3 + j]);
                if (j < 2) rgb += ',';
            }
            rgb += ')';
            this.gradient.addColorStop(i / 3, rgb);
        }

        this.ambient = (this.ambients[i1] - this.ambients[i0]) * time / last + this.ambients[i0];
    }
});

VK.Entity = Class.extend({
    // mark this entity as enemy that need to be kill to win level
    isEnemy: false,
    // mark this entity as a star to increment stars gain for level
    isStar: false,
    x: 0,
    y: 0,
    angle: 0,
    breakable: false,
    active: true,
    sprite: null,
    b2Body: null,
    b2World: null,
    isDesignMode: false,
    __iselected: false, // selected entity in design mode
    __allowPointer: false, // allow pointer event enteraction when not in debug mode
    touchstart: function (e) { },
    touchmove: function (e) { },
    touchend: function (e) { },
    touchcancel: function (e) { },
    beginContact: function (contact) { },
    endContact: function (contact) { },
    preSolve: function (contact, oldManifold) { },
    postSolve: function (contact, impulse) { },
    isPlayer: function () { return false; },
    isFital: function () { return false; },
    getXtype: function () {
        return VK.GameHelper.getXtype(this.name);
    },
    _setPositionAndAngle: function (b) {
        if (b) {
            b.SetPositionAndAngle(
                new b2Vec2((this.x + (this.moveSensorRadius)) / VK.Box2D.WORLD_SCALE, (this.y + (this.moveSensorRadius)) / VK.Box2D.WORLD_SCALE),
                0
            );
        }
    },
    setPositionAndAngle: function () {
        if (this.bodyMove) {
            this._setPositionAndAngle(this.bodyMove);
        }
        if (this.bodyRotate) {
            this._setPositionAndAngle(this.bodyRotate);
        }
    },
    canRotate: function () {
        return true;
    },
    createTimer: function (duration, callback_timeout, callback_tick, callback_cancel) {
        return this.getGameState().createTimer(duration, callback_timeout, callback_tick, callback_cancel);
    },
    getPixelPosition: function () {
        if (!this.b2Body) {
            return null;
        }
        var WORLD_SCALE = VK.Box2D.WORLD_SCALE;
        return { x: this.b2Body.GetPosition().x * WORLD_SCALE, y: this.b2Body.GetPosition().y * WORLD_SCALE };
    },
    getB2Position: function () {
        if (!this.b2Body) {
            return null;
        }
        return { x: this.b2Body.GetPosition().x, y: this.b2Body.GetPosition().y };
    },
    getAllowPointer: function () {
        return this.__allowPointer;
    },
    setAllowPointer: function (v) {
        this.__allowPointer = v;
    },
    getToolbarIcon: function () {
        // override in subclass to provide correct icon for level designer drag and drop toolbox
        return null;
    },
    getIsEnemy: function () {
        return this.isEnemy === true;
    },
    getScope: function () {
        // scope instance, not type
        return this.scope;
    },
    isPrivate: function () {
        return this.scope == VK.CONSTANT.ENTITY_SCOPE.PRIVATE;
    },
    setReversGravity: function (v) {
        this.reverse_gravity = v;
    },
    getReversGravity: function () {
        return this.reverse_gravity === true;
    },
    get: function (options) {
        var EX = VK.CONSTANT.ENTITY_EXTERN;
        ///
        // SUBCLASS SHOULD IMPLEMENT THIS TO ADD SPECIAL PROPERTIES BELONGING TO IT
        ///
        options = options || {};
        options[EX.ANGLE] = this.getAngle();
        options[EX.X] = this.getX();
        options[EX.Y] = this.getY();
        if (this.getWidth()) {
            options[EX.W] = this.getWidth();
        }
        if (this.getHeight()) {
            options[EX.H] = this.getHeight();
        }
        if (this.getVX()) {
            options[EX.VX] = this.getVX();
        }
        if (this.getIsEnemy()) {
            options[EX.IS_ENEMY] = true;
        }
        if (this.getIsStar()) {
            options[EX.IS_STAR] = true;
        }
        if (this.isBreakable()) {
            options[EX.BREAKABLE] = true;
        }
        if (this.getReversGravity()) {
            options[EX.REVERSE_GRAVITY] = true;
        }
        return options;
    },
    // set2 does special key value and also falls back to set stuff
    set2: function (options) {
        var EX = VK.CONSTANT.ENTITY_EXTERN;
        for (var key in options) {
            // we need special handling for compiler to know these attributes
            if (key == EX.IS_ENEMY) {
                this.setIsEnemy(options[key]);
            }
            else if (key == EX.IS_STAR) {
                this.setIsStar(options[key]);
            }
            else if (key == EX.ANGLE) {
                this.setAngle(options[key]);
            }
            else if (key == EX.BREAKABLE) {
                this.setBreakable(options[key]);
            }
            else if (key == EX.H) {
                this.setHeight(options[key]);
            }
            else if (key == EX.W) {
                this.setWidth(options[key]);
            }
            else if (key == EX.X) {
                this.setX(options[key]);
            }
            else if (key == EX.Y) {
                this.setY(options[key]);
            }
            else if (key == EX.VX) {
                this.setVX(options[key]);
            }
            else {
                this[key] = options[key];
            }
        }
    },
    getXtypeName: function () { return this.name; },
    setVX: function (v) { this.vx = v; },
    getVX: function () { return this.vx; },
    getWidth: function () { return this.w; },
    setWidth: function (v) { this.w = v; },
    getHeight: function () { return this.h; },
    setHeight: function (v) { this.h = v; },
    setIsEnemy: function (v) {
        this.isEnemy = v;
    },
    setIsStar: function (v) { this.isStar = v; },
    getIsStar: function () {
        return this.isStar === true;
    },
    getValue: function () {
        return this.value !== undefined ? this.value : 0;
    },
    setAngle: function (v) {
        this.angle = v;
        if (this.sprite) {
            this.sprite.angle = v;
        }
    },
    getAngle: function () {
        return this.angle;
    },
    getX: function () { return this.x; },
    setX: function (v) {
        this.x = v;
        if (this.sprite) {
            this.sprite.setX(v);
        }
    },
    getY: function () { return this.y; },
    setY: function (v) {
        this.y = v;
        if (this.sprite) {
            this.sprite.setY(v);
        }
    },
    isDef: function (o) {
        return VK.isDef(o);
    },
    setBreakable: function (v) {
        this.breakable = v;
    },
    isBreakable: function () {
        return this.breakable === true;
    },
    //isActiveToPaint: function () {
    //    // entities might have other stuff to do but not render. do not override
    //    return this.active;
    //},
    isActive: function () {
        return this.active;
    },
    setActive: function (v) {
        this.active = v;
    },
    clearBody: function () {
        this.b2Body = null;
    },
    createBody: function (isTouchSensor) { },
    getBody: function () {
        return this.b2Body;
    },
    initBefore: function (options) {
        //        var gs = this.getGameState();
        //        if (gs && gs.isDesignMode) {
        //            this.isDesignMode = gs.isDesignMode();
        //        }
        var tick = (new Date()).getTime();

        if (!this.name) {
            //throw new Error('Entity need a name!');
        }

        this.id = this.name ? this.name + '-' + tick : 'UNKNOW-' + tick;
    },
    initAfter: function (options) {
        if (this.angle !== undefined) {
            this.setAngle(this.angle);
        }
        // we going to keep options so we can clone the object later to for level create stop/run
        this.options = options;
    },
    init: function (options) {
        this.set2(options);
    },
    deactivate: function () {
        this.active = false;
    },
    destroy: function () {
        if (this.getGameState()) {
            this.getGameState().removeEntity(this);
        }
        if (this.b2Body) {
            this.b2World.DestroyBody(this.b2Body);
            this.b2Body = null;
        }
        this.destroyDesignerTouchSensors();
    },
    destroyDesignerTouchSensors: function () {
        if (this.bodyMove) {
            this.getGameState().addBodiesScheduledForRemoval(this.bodyMove);
            this.bodyMove = null;
        }
        if (this.bodyRotate) {
            this.getGameState().addBodiesScheduledForRemoval(this.bodyRotate);
            this.bodyRotate = null;
        }
    },
    update: function () {
        if (this.b2Body) {
            if (!this.sprite) {
                this.sprite = {};
            }
            this.sprite.x = (this.b2Body.GetPosition().x * VK.Box2D.WORLD_SCALE);
            this.sprite.y = (this.b2Body.GetPosition().y * VK.Box2D.WORLD_SCALE);
            this.sprite.angle = Math.normalRelativeAngle(this.b2Body.GetAngle());
        }
    },
    draw: function (context, timeDelta, hitTest) {
        if (this.getIsSelected() && hitTest !== true) {
            this.drawSelectedRotate(context);
        }
    },
    getGameState: function () { return VK.__currentState; },
    getPosition: function () {
        return VK.Box2dUtils.parsePoint(this.b2Body.GetPosition().Copy())
    },
    setPosition: function (value) {
        this.b2Body.SetPosition(Box2dUtils.parseB2Vec2(value.x, value.y))
    },
    getIsSelected: function () {
        return this.__iselected;
    },
    drawSelectedCircle: function (context, timeDelta, isRotateHandler, sprite, radius) {
        context.arc(sprite.x, sprite.y, radius, Math.PI * 0, Math.PI * 2);
    },
    drawSelectedRotate: function (context, timeDelta, isRotateHandler, hitTest) {
        //isRotateHandler is == false to detect moving pixel click test
        var sprite = this.sprite;
        if (!sprite) {
            return;
            //throw new Error('NO SPRITE');
        }
        context.save();
        context.lineWidth = 1;
        var lineWidth = 40;
        if (isRotateHandler == false) {
            lineWidth = 0;
        } else if (this.canRotate() === false) {
            // entity can only move in designer
            lineWidth = 8;
        }
        
        // calculate radius
        var radius = sprite.height > sprite.width ? sprite.height / 2 + lineWidth * .75 : sprite.width / 2 + lineWidth * .75;
        if (isNaN(radius) && this.radius) {
            radius = this.radius;
        }
        if (radius < 40) {
            radius = 40;
        }

        if (radius > 80) {
            radius = 80;
        }

        if (!hitTest) {
            context.globalAlpha = .3;
        }
        context.beginPath();
        this.drawSelectedCircle(context, timeDelta, isRotateHandler, sprite, radius);
        context.lineWidth = lineWidth;
        //context.lineCap = 'round';
        context.strokeStyle = '#0099CC';
        if (this.ENTITY_DESIGN_STATE == VK.CONSTANT.ENTITY_DESIGN_STATE.DELETE_CANDIDATE) {
            // give delete hint
            context.strokeStyle = 'red';
            context.globalAlpha = .5;
        }
        if (isRotateHandler == false) {
            context.fill();
        }
        else {
            context.stroke();
        }
        context.restore();
    },

    setIsSelected: function (v) {
        this.__iselected = v;
        this.destroyDesignerTouchSensors();
        if (v) {
            this.createDesignerSensorRotate();
            this.createDesignerSensorMove();
        }
        else {
            this.createDesignerSensorMove();
        }
    },

    createDesignerSensorRotate: function () {
        if (this.moveSensorRadius && this.canRotate() && this.isDesignMode && this.b2World) {
            this.bodyRotate = this.createDesignerSensorBody((this.moveSensorRadius * 2) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.ROTATE });
        }
    },
    createDesignerSensorMove: function () {
        if (this.isDesignMode && this.moveSensorRadius && this.b2World) {
            this.bodyMove = this.createDesignerSensorBody((this.moveSensorRadius) / VK.Box2D.WORLD_SCALE, { Name: this.name, Entity: this, action: VK.CONSTANT.DESIGNER.MOVE });
        }
    },
    createDesignerSensorBodyDef: function (userData) {
        return VK.Box2dUtils.generateB2BodyDef(b2Body.b2_staticBody, (this.x + (this.moveSensorRadius)), (this.y + (this.moveSensorRadius)), userData);
    },
    createDesignerSensorBody: function (radius, userData) {

        userData = userData || { Name: this.name, Entity: this };

        var shape = new b2CircleShape((radius ? radius : (radius) / VK.Box2D.WORLD_SCALE));
        var fixture = VK.Box2dUtils.generateB2FixtureDef(0, 3, 0.1);
        fixture.isSensor = true;
        fixture.shape = shape;
        var bodyDef = this.createDesignerSensorBodyDef(userData);
        var body = this.b2World.CreateBody(bodyDef);
        body.CreateFixture(fixture);

        return body;
    }

});


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
///// BOX2D /////////////////////////////////////////////
var b2Vec2 = Box2D.Common.Math.b2Vec2
,   b2AABB = Box2D.Collision.b2AABB
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
,   b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
,   b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
;

VK.CONSTANT = {
    DESIGN_LEVEL_DEF: {
        SHARED_ID: 'sharedId',
        SCREENSHOT: 'screenshot',
        WORLD_WIDTH: 'world_width',
        WORLD_HEIGHT: 'world_height',
        ENTITIES: 'entities',
        ID: 'id',
        THEME: 'theme',
        CANSHARE: 'canshare',
        UNLIMITED_LIFE: 'unlimited_life'
    },
    ENTITY_DESIGN_STATE: {
        JUST_CREATED: 0,
        CREATED: 1,
        DELETE_CANDIDATE: 2
    },
    ENTITY_SCOPE: {
        PRIVATE: 'private',
        INTERNAL: 'internal',
        DEPRECATED: 'DEPRECATED',
        PUBLIC: 'public',
        PROTECTED: 'protected'
    },
    ENTITY_EXTERN: {
        XTYPE: 'xtype',
        IS_ENEMY: 'isEnemy',
        IS_STAR: 'isStar',
        ANGLE: 'angle',
        BREAKABLE: 'breakable',
        H: 'h',
        W: 'w',
        X: 'x',
        Y: 'y',
        VX: 'vx',
        COLOR: 'color',
        RGB: 'rgb',
        RADIUS: 'radius',
        IMAGE: 'icon',
        REVERSE_GRAVITY: 'reverse_gravity'
    },
    PEG: "peg",
    PLAYER: "monkey",
    BANANA: "banana",
    BALLON: "ballon",
    BALLON2: "BALLON2",
    FRUITBONUS: "fruitbonus",
    Cloud1: "Cloud1",
    Cloud2: "Cloud2",
    Cloud3: "Cloud3",
    Cloud4: "Cloud4",
    STAR: "STAR",
    SPINNING_COIN_GOLD: 'spinning_coin_gold',
    SPINNING_COIN_SILVER: 'SPINNING_COIN_SILVER',
    SPINNING_GEM_YELLOW: 'SPINNING_GEM_YELLOW',
    PlayerPointer: "PlayerPointer",
    ROPE: "rope",
    OSCILLATING_BUBBLE: "OSCILLATING_BUBBLE",
    BLOCKS: {
        GLASS_TRIANGLE: "TriangleBlockGlass",
        WOOD_LONG: "WoodLongBlock",
        WOOD_LONG_ANGLE: "WOOD_LONG_ANGLE",
        WOOD_MID: "WOOD_MID",
        WOOD_ROUND: "WOOD_ROUND",
        CRATE: "CRATE",
        CRATE2: "CRATE2",
        CRATE_TNT: "CRATE_TNT",
        GlASS_CUBE: "GlASS_CUBE",
        GLASS_ROUND: "GLASS_ROUND",
        BROWN_CUBE: "BROWN_CUBE",
        BROWN_MID: "BROWN_MID",
        BRICK_LONG: "BRICK",
        BRICK_CUBE: "BRICK_CUBE",
        BRICK_MID: "BRICK_MID",
        BRICK_ROUND: "BRICK_ROUND",
        GlASS_LONG: "GlASS_LONG",
        GlASS_MID: "GlASS_MID"
    },
    WALL: {
        WALL_TYPE: "WALL_TYPE",
        IS_WALL: "WALL_IsWALL",
        BOTTOM: "WALL_GROUND",
        TOP: "WALL_TOP",
        LEFT: "WALL_LEFT",
        RIGHT: "WALL_RIGHT"
    },
    EVENT: {
        MOUSEUP: '/event/mouseup/',
        MOUSEMOVE: '/event/mousemove/'
    },
    PUBSUB: {
        INGAME_ACTION: '/game/doaction/',
        SCROLLER_ACTION: '/scroller/doaction/',
        INGAME_PLAYSOUND: 'INGAME_PLAYSOUND',
        INGAME_PLAY_LEVEL_BACKGROUND_SOUND: 'LEVEL_BACKGROUND_SOUND',
        INGAME_PLAY_THEME_SOUND: 'INGAME_PLAY_THEME_SOUND',
        INGAME_ENABLED_SOUND: 'INGAME_ENABLED_SOUND',
        INGAME_TOGGLE_MUSIC_BUTTON: 'INGAME_TOGGLE_MUSIC_BUTTON',
        SHARE: '/share/level/',
        LEVEL_COMPLETE: 'LEVEL_COMPLETE',
        TRIAL_CONVERSION_SUCCESS: 'TCS'

    },
    DESIGNER: {
        MOVE: 'MOVE',
        ROTATE: 'ROTATE'
    }
};

VK.Box2D = {
    TIMESTEP: 1 / 24,
    VELOCITY_ITERATIONS: 5,
    POSITION_ITERATIONS: 3,
    PLAYER: {
        frequencyHz: 40.0, // 40.0
        dampingRatio: 30.5 // 30.5
    },
    WORLD_SCALE: 30,
    WORLD_GRAVITY: 10.0,
    getB2WORLD: function () {
        return new b2World(
            // 0.001 to simulate wind
            new b2Vec2(0.011, VK.Box2D.WORLD_GRAVITY)   //gravity
            , true                 //allow sleep
        );
    },
    GetBodyAtMouse: function (b2World) {
        VK.Box2D.mousePVec = new b2Vec2(VK.Box2D.mouseX, VK.Box2D.mouseY);
        var aabb = new b2AABB();
        aabb.lowerBound.Set(VK.Box2D.mouseX - 0.001, VK.Box2D.mouseY - 0.001);
        aabb.upperBound.Set(VK.Box2D.mouseX + 0.001, VK.Box2D.mouseY + 0.001);
        // Query the world for overlapping shapes.
        VK.Box2D.SelectedBody = null;
        b2World.QueryAABB(VK.Box2D.GetBodyCB, aabb);
        return VK.Box2D.SelectedBody;
    },
    GetBodyCB: function (fixture) {
        if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), VK.Box2D.mousePVec)) {
                VK.Box2D.SelectedBody = fixture.GetBody();
                return false;
            }
        }
        return true;
    }
};
VK.GetLocalStorage = function () {
    if (!VK.isDef(VK.__LocalStorage)) {
        VK.__LocalStorage = new CAAT.modules.LocalStorage()
    }
    return VK.__LocalStorage;
};
VK.DOM = {
    Wait: {
        __create: function () {
            if (!this.__waitDIV) {
                this.__waitDIV = VK.DOM.createDiv('', '', VK.DOM.getContainer());
                this.__waitDIV.style.zIndex = 9999;
                VK.DOM.setInnerHTML(this.__waitDIV, [
                    '<div class="fill wait-underlay">',
                    '</div>',
                    '<div class="fill" style="display:table;text-align:center; position:absolute; top:0px; z-index:10000;">',
                        '<div style="display:table-cell; vertical-align:middle;" class="wait-title">Loading...</div>',
                    '</div>'
                ].join(''));

                this.__waitTitleDiv = this.__waitDIV.getElementsByClassName("wait-title")[0];
            }
            return this.__waitDIV;
        },
        show: function (title) {
            var div = this.__create();
            if (div) {
                VK.DOM.setInnerHTML(this.__waitTitleDiv, title || 'Loading...');
                div.style.display = '';
            }
        },
        hide: function () {
            var div = this.__create();
            if (div) {
                div.style.display = 'none';
            }
        }
    },
    setInnerHTML: function (element, s) {
        if (VK.isWinJS()) {
            window['WinJS']['Utilities']['setInnerHTMLUnsafe'](element, s);
        }
        else {
            element.innerHTML = s;
        }
    },
    PreventDefaultManipulationAndMouseEvent: function (evt) {
        if (evt['preventDefault']) {
            evt['preventDefault']();
        }
        if (evt['preventManipulation']) {
            evt['preventManipulation']();
        }
        if (evt['preventMouseEvent']) {
            evt['preventMouseEvent']();
        }
    },
    Event: {
        Type: {
            onPointerDown: 'onPointerDown',
            onPointerMove: 'onPointerMove',
            onPointerUp: 'onPointerUp',
            onPointerCancel: 'onPointerCancel'
        },
        cancelBubble: function (e) {
            var evt = e ? e : window.event;
            if (evt.stopPropagation) evt.stopPropagation();
            if (evt.cancelBubble != null) evt.cancelBubble = true;
        },
        isWin7: function () {
            try {
                // Windows NT 6.1 == win8
                return navigator.appVersion.indexOf("Windows NT 6.1") !== -1;
            }
            catch (e) { }
            return false;
        },
        isMsPointer: function () {
            return window.navigator['msPointerEnabled'] !== undefined;
        },
        isTouch: function () {
            return 'ontouchstart' in window || (this.isMsPointer() && !this.isWin7());
        },
        getPointerMoveEventName: function () {
            var type = "mousemove";
            if (this.isTouch()) {
                if (this.isMsPointer()) {
                    type = "MSPointerMove";
                }
                else {
                    type = "touchmove";
                }
            }
            return type;
        },
        getPointerUpEventName: function () {
            var type = "mouseup";
            if (this.isTouch()) {
                if (this.isMsPointer()) {
                    type = "MSPointerUp";
                }
                else {
                    type = "touchend";
                }
            }
            return type;
        },
        getPointerCancelEventName: function () {
            var type = null;
            if (this.isTouch()) {
                if (this.isMsPointer()) {
                    type = "MSPointerCancel";
                }
                else {
                    type = "touchcancel";
                }
            }
            return type;
        },
        getPointerDownEventName: function () {
            var type = "mousedown";
            if (this.isTouch()) {
                if (this.isMsPointer()) {
                    type = "MSPointerDown";
                }
                else {
                    type = "touchstart";
                }
            }
            return type;
        },
        addEventListener: function (type, dom, listener) {
            dom.addEventListener(type, listener, false);
        },
        onPointerDown: function (dom, listener) {
            var type = this.getPointerDownEventName();
            this.addEventListener(type, dom, listener);
        },
        removeEventOnPointer: function (name, dom, listener) {
            var type = null;
            switch (name) {
                case VK.DOM.Event.Type.onPointerDown:
                    type = this.getPointerDownEventName();
                    break;
                case VK.DOM.Event.Type.onPointerMove:
                    type = this.getPointerMoveEventName();
                    break;
                case VK.DOM.Event.Type.onPointerUp:
                    type = this.getPointerUpEventName();
                    break;
                case VK.DOM.Event.Type.onPointerCancel:
                    type = this.getPointerCancelEventName();
                    break;
            }
            if (type) {
                dom.removeEventListener(type, listener, false);
            }
        },
        onPointerMove: function (dom, listener) {
            var type = this.getPointerMoveEventName();
            this.addEventListener(type, dom, listener);
        },
        onPointerUp: function (dom, listener) {
            var type = this.getPointerUpEventName();
            this.addEventListener(type, dom, listener);
        },
        onPointerCancel: function (dom, listener) {
            var type = this.getPointerCancelEventName();
            if (type) {
                this.addEventListener(type, dom, listener);
            }
        }
    },
    createDiv: function (id, className, parent) {
        var div = document.createElement('div');
        var parent = parent || document.body;
        parent.appendChild(div);
        if (id) {
            div.id = id;
        }
        if (className) {
            div.className = className;
        }
        return div;
    },
    getContainer: function () {
        return document.getElementById('container');
    },
    getCanvasSize: function () {
        var canvas = this.getCanvas();
        return { w: canvas.width, h: canvas.height };
    },
    getCanvasOffset: function (force) {
        if (this._canvasOffsets && force !== true) {
            return this._canvasOffsets;
        }
        this._canvasOffsets = this.getElementPosition(this.getCanvas());
        return this._canvasOffsets;
    },
    getCanvas: function () {
        return jaws.canvas;
    },
    getElementPosition: function (element, parent) {
        var elem = element, tagname = "", x = 0, y = 0;

        while (elem != null && (typeof (elem) == "object") && (typeof (elem.tagName) != "undefined") && parent != elem) {
            y += elem.offsetTop;
            x += elem.offsetLeft;
            tagname = elem.tagName.toUpperCase();

            if (tagname == "BODY")
                elem = 0;

            if (typeof (elem) == "object") {
                if (typeof (elem.offsetParent) == "object")
                    elem = elem.offsetParent;
            }
        }
        return { x: x, y: y };
    }
};

(function () {

    var __xtype = {}; // holds class def so we can do look up to instantiate, {need to be unique name}
    var __myLevelLocalStorageKey = 'daf8e921-e65a-45f7-b7e5-6b5ce64f1616';

    VK.localStorage = {
        getMyLevels: function() {
            try {
                return JSON.parse(localStorage.getItem(__myLevelLocalStorageKey));
            }
            catch(e){}
        },
        deleteLevel: function (levelId, callback, categoryIndex) {
            var levels = this.getMyLevels() || [];
            var found = false;
            if (levelId) {
                var ID = VK.CONSTANT.DESIGN_LEVEL_DEF.ID;
                for (var i = 0; i < levels.length; i++) {
                    if (levels[i][ID] == levelId) {
                        levels.splice(i, 1);
                        localStorage.setItem(__myLevelLocalStorageKey, JSON.stringify(levels));
                        break;
                    }
                }
            }
            if (callback) {
                callback(categoryIndex);
            }
        },
        saveLevel: function (levelJson, levelId, callback) {
            try { // localStorage limited to 5 megs
                var levels = this.getMyLevels() || [];
                var found = false;
                if (levelId) {
                    var ID = VK.CONSTANT.DESIGN_LEVEL_DEF.ID;
                    for (var i = 0; i < levels.length; i++) {
                        if (levels[i][ID] == levelId) {
                            levels[i] = levelJson;
                            found = true;
                            break;
                        }
                    }
                }
                if (!found) {
                    // if not found or new push at end
                    levels.push(levelJson);
                }

                localStorage.setItem(__myLevelLocalStorageKey, JSON.stringify(levels));
                if (callback) {
                    callback(levels);
                }
            } catch (e) {
                // eat it
            }
        },
        clear: function (callback) {
            try {
                localStorage.removeItem(__myLevelLocalStorageKey);
                if (callback) {
                    callback();
                }
            } catch (e) {
                // eat it
            }
        },
        getMyLevelById: function (levelId) {
            var levels = VK.localStorage.getMyLevels();
            if (levels && levels.length) {
                var ID = VK.CONSTANT.DESIGN_LEVEL_DEF.ID;
                for (var i = 0; i < levels.length; i++) {
                    if (levels[i][ID] == levelId) {
                        return levels[i];
                    }
                }
            }
        }
    };
    
    VK.GameHelper = {
        LEVELS_PER_CARD: 12,
        musicEnabled: null,
        fxEnabled: null,
        hideAdCloseBtn: function () {
            //myAddClose
            var el = document.getElementById('myAddCloseBtn');

            if (el) {
                el.style.display = 'none';
            }
        },
        showAdCloseBtn: function () {
            //myAddClose
            var el = document.getElementById('myAddCloseBtn');

            if (el) {
                el.style.display = '';
            }
        },
        showAd: function () {
            var myAd = document.getElementById('myAd');

            if (myAd) {
                myAd.style.display = '';
            }
        },
        hideAd: function () {
            var myAd = document.getElementById('myAd');

            if (myAd) {
                myAd.style.display = 'none';
            }
        },
        isTrialLicense: function () {
            if (VK.isWinJS()) {
                return AppStore.isTrial();
            }
            else {
                return false;
            }
        },
        doTrialConversion: function (success_callback) {
            AppStore.doTrialConversion(function (success, message) {
                if (success) {
                    // CONVERT APP TO FULL VERSION
                    // REMOVE ANY RESTRICTIONS
                    // unlock locked game sets if already rendered, also isTrialLicense === true
                    PubSub.publish(VK.CONSTANT.PUBSUB.TRIAL_CONVERSION_SUCCESS, {});
                    
                    if (success_callback) {
                        success_callback();
                    }
                }
                else {
                    //var msg = new Windows.UI.Popups.MessageDialog(message, "Oops...");
                    //msg.showAsync();
                }
            });
        },
        freeTrialCreateLevelsCount: function () {
            // ONLY ALLOW THREE LEVELS CREATED IN TRIAL MODE
            if (VK.GameHelper.isTrialLicense()) {
                return 6;
            }
            return Number.POSITIVE_INFINITY;
        },
        getThemeById: function (themeId) {
            for (var i = 0; i < VK.Resources.THEMES.length; i++) {
                if (VK.Resources.THEMES[i].id == themeId) {
                    return VK.Resources.THEMES[i];
                }
            }
            // default to return first theme
            return VK.Resources.THEMES[0];
        },
        getNextTheme: function (currentThemeId) {
            if (currentThemeId) {
                for (var i = 0; i < VK.Resources.THEMES.length; i++) {
                    if (VK.Resources.THEMES[i].id == currentThemeId && VK.Resources.THEMES[i + 1] && VK.Resources.THEMES[i + 1].private !== true) {
                        return VK.Resources.THEMES[i + 1];
                    }
                }
            }
            return VK.Resources.THEMES[0];
        },
        setFxEnabled: function (v) {
            try {
                if (v == 'Y') {
                    this.fxEnabled = true;
                }
                else {
                    this.fxEnabled = false;
                }
                localStorage.setItem("fxEnabled", v);
            } catch (e) { }
        },
        isFxEnabled: function () {
            if (this.fxEnabled === null) {
                try {
                    this.fxEnabled = localStorage.getItem("fxEnabled") !== 'N';
                } catch (e) { }
            }
            return this.fxEnabled;
        },
        setMusicEnabled: function (v) {
            try {
                if (v == 'Y') {
                    this.musicEnabled = true;
                }
                else {
                    this.musicEnabled = false;
                }
                localStorage.setItem("musicEnabled", v);
            } catch (e) { }
        },
        isMusicEnabled: function () {
            if (this.musicEnabled === null) {
                try {
                    this.musicEnabled = localStorage.getItem("musicEnabled") !== 'N';
                } catch (e) { }
            }
            return this.musicEnabled;
        },
        getSharedLevelId: function () {
            var sharedId = VK.GameHelper.getUrlParameterByName('sharedId');
            if (!VK.isNotDefOrNull(sharedId)) {
                return sharedId;
            }
            return undefined;
        },
        db_levels: null,
        set_db_levels: function (levels) {
            this.db_levels = levels;
        },
        getBottomWallHeight: function() {
            return 120;
        },
        deleteLevel: function (levelId, callback, categoryIndex) {
            if (VK.isWinJS()) {
                var me = this;
                PubSub.publish('/mylevel/delete/', {
                    'id': levelId, 'callback': function (levels) {
                        me.set_db_levels(levels);
                        if (callback) {
                            callback(categoryIndex);
                        }
                    }
                });
            }
            else {
                VK.localStorage.deleteLevel(levelId, callback, categoryIndex);
            }
        },
        savMyLevel: function (levelJson, levelId, callback) {
            if (VK.isWinJS()) {
                var me = this;
                PubSub.publish('/mylevel/addOrUpdate/', {
                    'levelJson': levelJson, 'levelId': levelId, 'callback': function (levels) {
                        me.set_db_levels(levels);
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
            else {
                VK.localStorage.saveLevel(levelJson, levelId, callback);
            }
        },
        clearMyLevels: function (callback) {
            VK.localStorage.clear(callback);
        },
        getMyLevelById: function (levelId) {
            if (VK.isWinJS()) {
                for (var i = 0; i < this.db_levels.length; i++) {
                    if (this.db_levels[i].id == levelId) {
                        return this.db_levels[i];
                    }
                }
            }
            else {
                return VK.localStorage.getMyLevelById(levelId);
            }
        },
        __getMyLevelsHelper: function (levels, callback) {
            var newLevel = { newLevel: true };
            if (levels && levels.length) {

                var levelSet = [];
                var card = {
                    levels: []
                };
                levelSet.push(card);
                for (var i = 0; i < levels.length; i++) {
                    if (i != 0 && i % VK.GameHelper.LEVELS_PER_CARD == 0) {

                        card = {
                            levels: []
                        };
                        levelSet.push(card);
                    }
                    card.levels.push(levels[i]);
                }

                if (levelSet[levelSet.length - 1].levels.length < VK.GameHelper.LEVELS_PER_CARD) {
                    levelSet[levelSet.length - 1].levels.push(newLevel);
                }
                else {
                    levelSet.push({
                        levels: [newLevel]
                    });
                }

                callback( levelSet );
                return;
            }
            callback( [{ levels: [newLevel] }] );
        },
        getMyLevels: function(callback) {
            if (VK.isWinJS()) {
                var me = this;
                PubSub.publish('/mylevel/getLevels/', {
                    'callback': function return_callback(levels) {
                        me.set_db_levels(levels);
                        me.__getMyLevelsHelper(levels, callback);
                    }
                });
            }
            else {
                var levels = VK.localStorage.getMyLevels() || [];
                this.__getMyLevelsHelper(levels, callback);
            }
        },
        getSharedPageLevels: function (pageIndex, callback) {
            var serv = new SharedLevelService('https://kreal.azurewebsites.net/services/sharedLevelService.ashx');
            serv.getSharedPageLevels(pageIndex, callback);
        },
        getWorldDimension: function() {
            var gameState = this.getCurrent();
            return {
                w: gameState.WORLD_WIDTH,
                h: gameState.WORLD_HEIGHT
            };
        },
        setXtype: function (name, clazz, more) {
            if (__xtype[name]) {
                throw new Error('name need to be unique to set xtype');
            }
            __xtype[name] = { name: name, clazz: clazz};
            if(more) {
                // copy more options
                for(var key in more) {
                    __xtype[name][key] = more[key];
                }
            }
        },
        getXtypes: function () {
            return __xtype;
        },
        getPublicXtypesAsArray: function () {
            var array = [];
            for(var key in __xtype) {
                var t = __xtype[key];
                if (t.clazz && !this.isPrivateXtype(t.name)) {
                    array.push(t);
                } 
            }
            return array;
        },
        getToolboxXtypesAsArray: function () {
            if (!this.__ToolboxXtypesAsArray) {
                this.__ToolboxXtypesAsArray = [];
                for (var key in __xtype) {
                    var t = __xtype[key];
                    if (t.clazz && !this.isPrivateXtype(t.name) &&
                        t.scope != VK.CONSTANT.ENTITY_SCOPE.DEPRECATED &&
                        t.scope != VK.CONSTANT.ENTITY_SCOPE.PROTECTED) {
                        var length = this.__ToolboxXtypesAsArray.length;

                        if (length && t.toolIndex !== undefined) {
                            
                            var success = false;
                            var temp = null;
                            for (var i = 0; i < length; i++) {
                                var temp = this.__ToolboxXtypesAsArray[i];

                                if (temp && (typeof temp.toolIndex === 'undefined' || t.toolIndex <= temp.toolIndex)) {
                                    // insert i
                                    this.__ToolboxXtypesAsArray.insert(i, t);
                                    success = true;
                                    break;
                                }
                            }
                            if (!success) {
                                this.__ToolboxXtypesAsArray.unshift(t);
                            }
                        }
                        else {
                            this.__ToolboxXtypesAsArray.push(t);
                        }
                    }
                }
            }
            return this.__ToolboxXtypesAsArray;
        },
        isDeprecatedXtype: function(name) {
            var t = this.getXtype(name);
            return t.scope == VK.CONSTANT.ENTITY_SCOPE.DEPRECATED;
        },
        isPrivateXtype: function(name) {
            var t = this.getXtype(name);
            return t.scope == VK.CONSTANT.ENTITY_SCOPE.PRIVATE;
        },
        getXtype: function (name) {
            return __xtype[name];
        },
        getXtypeClass: function (name) {
            if( !__xtype[name] ) {
                debugger
                throw new Error("cant find clazz: " + name);
            }
            return __xtype[name].clazz;
        },
        init: function () {
            PubSub.subscribe('/designer/stop/', this, function () {
                this.getCurrent().designLevel();
            });
            PubSub.subscribe('/designer/play/', this, function () {
                this.getCurrent().playLevel();
            });
            PubSub.subscribe('/designer/clear/', this, function () {
                this.clearMyLevels();
            });
        },
        __UrlParameter: {},
        getUrlParameterByName: function (name) {
            try {
                if (this.__UrlParameter[name]) {
                    return this.__UrlParameter[name];
                }
                var match = RegExp('[?&]' + name + '=([^&]*)')
                        .exec(window.location.search);
                this.__UrlParameter[name] = match && window['decodeURIComponent'](match[1].replace(/\+/g, ' '));

                return this.__UrlParameter[name];
            }
            catch (e) { }
            return null;
        },
        getCurrent: function () {
            return VK.__currentState;
        },
        getAllCategories: function() {
            return VK.GameData;
        },
        getDesignerLevelSet: function() {
            for(var i = 0; i < VK.GameData.length; i++) {
                if( VK.GameData[i].isMyLevel == true) {
                    return VK.GameData[i];
                }
            }
        },
        getCurrentCategorySet: function() {
            if( !this.__currentCategorySet ) {
                this.__currentCategorySet = VK.GameData[0];
            }
            return this.__currentCategorySet;
        },
        setCurrentCategorySet: function (v, callback_back, levelSetIndex, isDeleteMode) {
            levelSetIndex = typeof levelSetIndex != 'undefined' ? levelSetIndex : 0;
            this.__currentCategorySet = v;
            this.showLevelSet2(levelSetIndex, callback_back, isDeleteMode);
        },
        getCurrentLevelSetIndex: function () {
            return VK.__currentState.levelSetIndex;
        },
        setLevelData: function (current) {
            if (VK.isNotDefOrNull(current.levelSetIndex)) { return; }
            var leveDef = this.getLevelDef(current.levelSetIndex, current.levelIndex);
            // save stars count
            // IF UNDEFINED IT MEAN LEVEL NEVERED BEEN PLAYED ONCE YET
            if (leveDef.starsCount == undefined) {
                leveDef.starsCount = current.getStarsCount();
            }
            else if (leveDef.starsCount < current.getStarsCount()) {
                leveDef.starsCount = current.getStarsCount();
            }
            localStorage.setItem(leveDef.id, 1);
            localStorage.setItem(leveDef.id + '-starsCount', leveDef.starsCount);
            // TODO: save best score
        },
        showLevelSet: function (callback_back) {
            var c = this.getCurrent();
            callback_back = callback_back || c && c.callback_back;

            var levelSetIndex = this.getCurrentLevelSetIndex();
            this.showLevelSet2(levelSetIndex, callback_back);
        },
        showLevelSet2: function (levelSetIndex, callback_back, isDeleteMode) {
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, { play: true });
            jaws.clear();
            this.destroyCurrent();
            VK.InGameMenu.hidePauseButton();

            var categorySet = this.getCurrentCategorySet();

            var finish = function() {
                var menu = new VK.MonkeySlingMenu({ categorySet: categorySet, callback_back: callback_back, isDeleteMode: isDeleteMode });
                jaws.switchGameState(menu);
                menu.setActiveCard(levelSetIndex, false);
            };
            if(categorySet.isMyLevel === true ) {
                VK.GameHelper.getMyLevels(function(set){
                    categorySet.levelSet = set;
                    finish();
                });
            }
            else if (categorySet.isDownloaded === true) {
                VK.GameHelper.getSharedPageLevels(0, function (response) {
                    if (response && response.result) {
                        for (var m = 0; m < response.result.length; m++) {
                            response.result[m]['levelDef'] = JSON.parse(response.result[m]['levelDef']);
                        }
                    }

                    debugger
                    finish();
                });
            }
            else {
                finish();
            }
        },
        destroyCurrent: function () {
            var current = this.getCurrent();
            if (current) {
                current.destroy();
                VK.__currentState = null;
                return true;
            }
            return false;
        },
        switchGameState: function(state) {
            jaws.switchGameState(state);
        },
        loadLevelDesigner: function (options) {
            VK.DOM.Wait.show();
            var delay = function () {
                this.destroyCurrent();
                VK.InGameMenu.hidePauseButton();
                var d = new VK.TestDesigner(options);
                this.switchGameState(d);
                VK.DOM.Wait.hide();
            }.bind(this);
            
            delay.defer();
        },
        loadLevel: function (levelSetIndex, levelIndex, callback_back) {
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_THEME_SOUND, { play: false });
            var levelDef = this.getLevelDef(levelSetIndex, levelIndex);
            this.loadLevel2(levelDef, levelSetIndex, levelIndex, callback_back);
        },
        loadLevel2: function (levelDef, levelSetIndex, levelIndex, callback_back) {
            VK.DOM.Wait.show();
            var delay = function () {

                this.destroyCurrent();
                var game_level;

                if (levelDef.worldDef) {
                    // level defined in world
                    game_level = new VK.LevelLoaderPlayState({ callback_back: callback_back, levelDef: levelDef });
                }
                else if (levelDef.cls) {
                    var cls = levelDef.cls;
                    game_level = new cls({ callback_back: callback_back });
                }
                // set levelSetIndex / levelIndex on game level intance so we know where we are
                game_level.levelSetIndex = levelSetIndex;
                game_level.levelIndex = levelIndex;

                var categorySet = this.getCurrentCategorySet();

                game_level.levelCount = categorySet.levelSet[levelSetIndex].levels.length;
                game_level.categoryCount = categorySet.levelSet.length;
                jaws.switchGameState(game_level);


                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_LEVEL_BACKGROUND_SOUND, {play:true});

                VK.DOM.Wait.hide();

            }.bind(this);

            delay.defer();
        },
        isLevelUnLock: function (levelDef) {
            return levelDef.unlock === true;
        },
        unlockLevel: function (levelDef) {
            levelDef.unlock = true;
            localStorage.setItem(levelDef.id, 1);
        },
        unlockNextLevel: function (current) {
            var nextLevelDef = this.getNextLevelDef(current);
            if (nextLevelDef) {
                this.unlockLevel(nextLevelDef);
            }
        },
        getNextLevelDef: function (current) {
            if (!current) {
                return null;
            }
            var levelSetIndex = current.levelSetIndex,
                levelIndex = current.levelIndex + 1;
            return this.getLevelDef(levelSetIndex, levelIndex);
        },
        getLevelDef: function (levelSetIndex, levelIndex) {
            if (VK.isNotDefOrNull(levelSetIndex)) {
                return null;
            }
            var categorySet = this.getCurrentCategorySet();
            return categorySet.levelSet[levelSetIndex].levels[levelIndex];
        },
        next: function (current) {
            var levelSetIndex = current.levelSetIndex;
            var callback_back = current.callback_back;
            // index of next level to be loaded
            var levelIndex = current.levelIndex + 1;

            var nextLevelDef = this.getNextLevelDef(current);
            if (nextLevelDef) {
                this.unlockLevel(nextLevelDef);
                this.loadLevel2(nextLevelDef, levelSetIndex, levelIndex, callback_back);
            }
            else {
                // 1. check for end of category, go to next category
                // 2. if no more category, just show current for now
                var nextCategoryIndex = levelSetIndex + 1;

                var categorySet = this.getCurrentCategorySet();

                var nextCategory = categorySet.levelSet[nextCategoryIndex];
                if (nextCategory !== undefined) {
                    // move to next Category
                    var levelDef = this.getLevelDef(nextCategoryIndex, 0);
                    if (levelDef) {
                        // TODO: DO SOME AWESOME SCENE HERE MOVING TO NEXT CATEGORY
                        this.unlockLevel(levelDef);
                    }
                }
                else { // EVERY CATEGORY HAS BEEN DEFEATED WE ARE DONE!!!!!!!!!!!!!!
                    nextCategoryIndex = levelSetIndex;
                }
                this.showLevelSet2(nextCategoryIndex, callback_back);
            }
        }
    };
    VK.GameHelper.init();

})();