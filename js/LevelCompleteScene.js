(function () {
    //    var template = [
    //     '<div class="level-complete-template ingame-container fill" style="display:none;">',
    //        '<div class="ingame-shadow fill"></div>',
    //        '<div class="ingame-container fill">',
    //            '<div style="margin-left: auto; margin-right: auto; border:0px solid red;" class="ingame-stars-buttons-wrapper">',
    //                '<div class="ingame-stars-buttons-wrapper-shadow fill"></div>',
    //            '</div>',
    //            '<div style="margin-left: auto; margin-right: auto; border:0px solid red;" class="ingame-stars-buttons-wrapper">',
    //                '<canvas class="ingame-level-completed-canvas ingame-container fill" style="border:0px solid red; left:0px; top:0px;"></canvas>',
    //                '<table class="ingame-container fill ingame-stars-buttons-wrapper" border="0" cellpadding="0" cellspacing="0" style="background-colorXX:red;">',
    //                    '<tr>',
    //                        '<td align="center">',
    //                            '<div class="ingame-level-completed-title">',
    //                                'Level Cleared!',
    //                            '</div>',
    //                        '</td>',
    //                    '</tr>',
    //                    '<tr>',
    //                        '<td align="center" style="" valign=top>',
    //                            '<div class="level-completed-star-container">',
    //                                '<div class="level-completed-star level-completed-star-off" style="display:inline-block"></div>',
    //                                '<div class="level-completed-star level-completed-star-off" style="display:inline-block"></div>',
    //                                '<div class="level-completed-star level-completed-star-off" style="display:inline-block"></div>',
    //                            '</div>',
    //                        '</td>',
    //                    '</tr>',
    //                    '<tr>',
    //                        '<td align="center" valign="top">',
    //                            '<div style="min-height:100px;">',
    //                                '<div style="margin-bottom:10px;">',
    //                                    '<div class="ingame-btn-main" style="display:inline-block"></div>',
    //                                    '<div class="ingame-btn-refresh" style="display:inline-block; margin-left:10px;"></div>',
    //                                    '<div class="ingame-btn-play" style="display:inline-block;  margin-left:10px;"></div>',
    //                                '</div>',
    //                            '</div>',
    //                        '</td>',
    //                    '</tr>',
    //                '</table>',
    //            '</div>',
    //        '</div>',
    //    '</div>'].join('');


    var m_element_root = null;
    var getElementRoot = function () {
        //if (!m_element_root) {
            //            var wrapper = VK.DOM.createDiv(null, '', VK.DOM.getContainer());

            //            VK.DOM.setInnerHTML(wrapper, template);

            var size = VK.DOM.getCanvasSize();
            m_element_root = document.getElementsByClassName('level-complete-template')[0];

            var canvas = m_element_root.getElementsByClassName('ingame-level-completed-canvas')[0];
            // set view w/h
            canvas.style.width = size.w + 'px';
            canvas.style.height = size.h + 'px';
        //}
        //m_element_root.style.display = 'none';
        return m_element_root;
    };

    var m_director = null;
    var getDirector = function (width, height, canvas) {
        if (!m_director) {
            m_director = new CAAT.Director();
        }

        m_director.initialize(width, height, canvas).
            setClear(false);

        return m_director;
    };


    // TODO: FIX THIS HACK!!!!
    var init_event = false;
    // END
    VK.LevelCompleteDOM = Class.extend({
        starsCount: 0,
        active: true,
        setActive: function (v) {
            this.active = v;
        },
        getActive: function () {
            return this.active;
        },
        failed: false,
        destroy: function (callback) {
            this.removeListeners();
            var dom_root = getElementRoot();
            dom_root.style.display = 'none';

            //jQuery(dom_root).fadeOut(400, function () {
            //    if (callback) {
            //        callback();
            //    }
            //});

            this.setActive(false);
            var canvas = dom_root.getElementsByClassName('ingame-level-completed-canvas')[0];
            canvas.width = canvas.width;
            canvas.height = canvas.height;
        },
        showButtons: function () {
            var dom_root = getElementRoot();
            var buttons_container = dom_root.getElementsByClassName('ingame-btn-main')[0].parentNode;
            jQuery(buttons_container).fadeIn('slow', function () {
                // Animation complete
            });
        },
        init: function (options) {
            PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_LEVEL_BACKGROUND_SOUND, { play: false });
            this.id = 'LevelComplete-' + (new Date()).getTime(),
            this.starsCount = 0;
            this.active = true;
            this.set(options);

            //  TODO: winning level should count as 1 star?????
            this.starsCount = this.gameState.getStarsCount();
            if (this.starsCount > 3) {
                this.starsCount = 3;
            }

            var me = this;
            // we are in shared level mode
            var sharedId = VK.GameHelper.getSharedLevelId();
            
            var container = VK.DOM.getContainer();
            var width = container.clientWidth;
            var height = container.clientHeight;

            var dom_root = getElementRoot();

            var canvas = dom_root.getElementsByClassName('ingame-level-completed-canvas')[0];
            var context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            // clear canvas drawing
            context.clearRect(0, 0, width, height);
            

            jQuery('.ingame-stars-buttons-wrapper').height(height);

            jQuery(dom_root).fadeIn(400, function () {
                // Animation complete
            });

            var buttons_container = dom_root.getElementsByClassName('ingame-btn-main')[0].parentNode;
            // HIDE BUTTONS CONTAINER if starsCount == 0
            buttons_container.style.display = 'none';

            this.addListener(VK.DOM.Event.Type.onPointerDown, dom_root.getElementsByClassName('ingame-btn-main')[0], function (e) {
                this.destroy();
                VK.GameHelper.showLevelSet();
            } .bind(this));

            this.addListener(VK.DOM.Event.Type.onPointerDown, dom_root.getElementsByClassName('ingame-btn-refresh')[0], function (e) {
                this.destroy();
                VK.GameHelper.getCurrent().restartGame();
            } .bind(this));


            // NOTE: GOOGLE COMPILER WONT LET US HAVE MOVE EVENTS, IT GIVES RUNTIME ERRORS..WORK AROUND REUSE ONE THAT IS HIDDEN (HACK HACK)

            var domNode = /*sharedId ? dom_root.getElementsByClassName('ingame-btn-share')[0] :*/ dom_root.getElementsByClassName('ingame-btn-play')[0];


            this.addListener(VK.DOM.Event.Type.onPointerDown, domNode, function (e) {
                // allow to reshare a shared level to fb
                //if (sharedId) {
                //    PubSub.publish(VK.CONSTANT.PUBSUB.SHARE, {
                //        'callback': function (sharedId) {

                //        } .bind(this),
                //        'sharedId': sharedId
                //    });
                //}
                //else {
                this.destroy();
                VK.GameHelper.next(VK.GameHelper.getCurrent());
                //}
            } .bind(this));

            /// END OD STUPIDNESS!!!!

            var director = getDirector(width, height, canvas).setClear(false);
            director.emptyScenes();

            var star_divs = dom_root.getElementsByClassName('level-completed-star');
            // reset stars images
            for (var m = 0; m < star_divs.length; m++) {
                star_divs[m].className = 'level-completed-star level-completed-star-off';
            }


            dom_root.getElementsByClassName('ingame-btn-main')[0].style.display = 'inline-block';
            dom_root.getElementsByClassName('ingame-btn-refresh')[0].style.display = 'inline-block';
            dom_root.getElementsByClassName('ingame-btn-play')[0].style.display = 'inline-block';

            dom_root.getElementsByClassName('ingame-btn-stop')[0].style.display = 'none';
            dom_root.getElementsByClassName('ingame-btn-share')[0].style.display = 'none';



            // set failed/win level display states

            if (this.failed) {
                // hide play next level button
                dom_root.getElementsByClassName('ingame-btn-play')[0].style.display = 'none';
                dom_root.getElementsByClassName('level-completed-star-container')[0].style.display = 'none';
                dom_root.getElementsByClassName('ingame-level-completed-title')[0].innerText = 'Level Failed!';

            }
            else {
                dom_root.getElementsByClassName('ingame-btn-play')[0].style.display = 'inline-block';
                dom_root.getElementsByClassName('level-completed-star-container')[0].style.display = '';
                dom_root.getElementsByClassName('ingame-level-completed-title')[0].innerText = 'Level Cleared!';
            }

            // hide play next button on design running mode
            if (this.isDesignModeRunning) {
                /*
                    1. hide all buttons
                    2. show stop button
                    3. show share button (only works in RT)
                */
                dom_root.getElementsByClassName('ingame-btn-play')[0].style.display = 'none';
                dom_root.getElementsByClassName('ingame-btn-main')[0].style.display = 'none';

                var btnStop = dom_root.getElementsByClassName('ingame-btn-stop')[0];
                btnStop.style.display = 'inline-block';
                
                this.addListener(VK.DOM.Event.Type.onPointerDown, btnStop, function (e) {
                    this.destroy();
                    VK.GameHelper.getCurrent().unpause();
                    VK.GameHelper.getCurrent().designLevel2();
                    // stop
                }.bind(this));

                
                var btnShare = dom_root.getElementsByClassName('ingame-btn-share')[0];

                if (VK.isWinJS()) {
                    btnShare.style.display = 'inline-block';
                    this.addListener(VK.DOM.Event.Type.onPointerDown, btnShare, function (e) {
                        var current = VK.GameHelper.getCurrent();
                        if (VK.isWinJS()) {
                            current.shareLevel();
                        }
                        else {
                            this.destroy();
                            current.unpause();
                            current.designLevel2();
                        }
                        // stop
                    }.bind(this));
                }
                else {
                    btnShare.style.display = 'none';
                }
            }

            if (sharedId) {

                dom_root.getElementsByClassName('ingame-btn-main')[0].style.display = 'none';
                dom_root.getElementsByClassName('ingame-btn-play')[0].style.display = 'none';

                //dom_root.getElementsByClassName('ingame-btn-share')[0].style.display = 'inline-block';
            }

            var starDelegates = [];

            var star_width = star_divs[0].clientWidth;
            var star_height = star_divs[0].clientHeight;
            var starsCount = this.starsCount;

            var canvasOffset = VK.DOM.getCanvasOffset();

            for (var i = 0; i < starsCount; i++) {
                var pos = VK.DOM.getElementPosition(star_divs[i]);
                starDelegates.push(
                {
                    i: i,
                    x: pos.x - canvasOffset.x,
                    y: pos.y - canvasOffset.y,
                    before: function (index) {
                        star_divs[index].className = 'level-completed-star level-completed-star-on';
                    }
                });
            }

            var score = this.gameState.getScore();

            var __scene = function (director) {
                if (this.failed) { me.showButtons(); return; }
                var scene = new VK.CAAT.LevelCompleteScene().create(director, { starDelegates: starDelegates, score: score })
                scene.stars_callback_timeout = function () {
                    me.showButtons();
                };

                director.easeIn(
                    0,
                    CAAT.Scene.prototype.EASE_TRANSLATE,
                    1000,
                    false,
                    CAAT.Actor.prototype.ANCHOR_TOP,
                    new CAAT.Interpolator().createExponentialInOutInterpolator(5, false));

                var renderFrame = function () {
                    if (!me.getActive()) { return; }
                    context.clearRect(0, 0, width, height);
                    var t = new Date().getTime();
                    var dr = director
                    if (dr.renderMode === CAAT.Director.RENDER_MODE_CONTINUOUS || dr.needsRepaint) {
                        dr.renderFrame();
                    }
                    t = new Date().getTime() - t;
                    CAAT.FRAME_TIME = t;

                    if (CAAT.RAF) {
                        CAAT.REQUEST_ANIMATION_FRAME_TIME = new Date().getTime() - CAAT.RAF;
                    }
                    CAAT.RAF = new Date().getTime();
                    window.requestAnimFrame(renderFrame, 0);
                };

                renderFrame();

                if (starsCount == 0) {
                    scene.stars_callback_timeout();
                }

            } .bind(this);

            if (init_event == false) {
                new CAAT.ImagePreloader().loadImages(
                VK.CAAT.Resources,
                function (counter, images) {
                    if (counter == images.length) {
                        director.setImagesCache(images);
                        __scene(director);
                    }
                });
            }
            else {
                __scene(director);
            }
        }
    });

    VK.CAAT.LevelCompleteScene = function () {
        this.listener = [];
        return this;
    };

    VK.CAAT.LevelCompleteScene.prototype = {
        stars_callback_timeout: function () { },
        createTimer: function (timeout, time) {
            var ttask = this.directorScene.createTimer(
                this.directorScene.time,
                time || 1100,
                timeout,
                null,
                null
            );
            return this;
        },
        create: function (director, options) {
            director.emptyScenes();

            this.numbersImageSmall = new CAAT.SpriteImage().initialize(
                    VK.GameHelper.getCurrent().director.getImage('numberssmall'), 1, 10);

            this.directorScene = director.createScene();

            this.directorScene.activated = function () {

            };

            var w = jaws.width; // director.width
            var controls = new CAAT.ActorContainer();
            controls.setBounds(0, 0, w, director.height);

            this.directorScene.addChild(controls);

            // scoreboard w: 771
            var scoreActor = new VK.CAAT.ScoreActor().
                    initialize(this.numbersImageSmall, VK.GameHelper.getCurrent().director.getImage('scoreboard'), { score: options.score });
           

            

            scoreActor.setLocation((w / 2) - 171 / 2, (director.height / 2) + 10);

            
            controls.addChild(scoreActor);

            var particle = new VK.CAAT.ParticleStarContainerActor().initialize(director, this.directorScene, { x: 0, y: 0, w: w, h: director.height, time: 600 });

            // add the actor.
            this.directorScene.addChild(particle);

            var directorScene = this.directorScene;
            var me = this;
            this.directorScene.behaviorExpired = function () {
                //
                var action = function (delegate, max) {
                    delegate.before(delegate.i);

                    VK.GameHelper.getCurrent().playSound('star');
                    particle.activateBehavior({ x: delegate.x, y: delegate.y, width: 150, height: 150 });
                    particle.activateBehavior({ x: delegate.x, y: delegate.y, width: 200, height: 200 });
                    particle.activateBehavior({ x: delegate.x, y: delegate.y, width: 250, height: 250 });

                    if (delegate.i + 1 == max) {
                        me.stars_callback_timeout();
                    }
                };

                var doStarScene = function (i, max) {
                    if (i < max) {
                        me.createTimer(function () {
                            action(options.starDelegates[i], max);
                            //doStarScene(i + 1, max);
                        });
                        doStarScene(i + 1, max);
                    }
                };
                if (options.starDelegates.length > 0) {
                    doStarScene(0, options.starDelegates.length);
                }
                else {

                }
                //                if (options.starDelegates.length > 0) {
                //                    me.createTimer(function () {
                //                        action(options.starDelegates[0]);
                //                        if (options.starDelegates.length > 1) {
                //                            me.createTimer(function () {
                //                                action(options.starDelegates[1]);
                //                                if (options.starDelegates.length > 2) {
                //                                    me.createTimer(function () {
                //                                        action(options.starDelegates[2]);
                //                                    });
                //                                }
                //                            });
                //                        }
                //                    });
                //                }
                if (options.score > 0) {
                    VK.GameHelper.getCurrent().playSound('score_count');
                }
            };
            return this;
        }
    };


    VK.CAAT.ScoreActor = function () {
        VK.CAAT.ScoreActor.superclass.constructor.call(this);
        return this;
    };

    VK.CAAT.ScoreActor.prototype = {

        numDigits: 6,

        incrementScore: 0,
        maxScore: 0,
        minScore: 0,
        currentScore: 0,

        numbers: null,

        startTime: 0,
        interpolator: null,
        scoreDuration: 2000,

        font: null,

        FONT_CORRECTION: .6,

        reset: function () {
            this.currentScore = 0;
            this.maxScore = 0;
            this.minScore = 0;
            this.currentScore = 0;
            this.setScore();
        },
        activateBehavior: function (options) {
        },
        initialize: function (font, background, options) {
            var i;
            this.incrementScore = options.score;
            this.maxScore = options.score;
            this.font = font;
            this.interpolator = new CAAT.Interpolator().createExponentialInOutInterpolator(2, false);
            this.setBackgroundImage(background, true);

            for (i = 0; i < this.numDigits; i++) {
                var actor = new CAAT.Actor().
                        setBackgroundImage(font.getRef(), true).
                        setLocation(
                            (((this.width - this.numDigits * this.font.singleWidth * this.FONT_CORRECTION) / 2) >> 0) +
                                (i * this.font.singleWidth * this.FONT_CORRECTION) - 5,
                            12
                        ).
                        setScale(this.FONT_CORRECTION, this.FONT_CORRECTION);

                this.addChild(actor);
            }
            return this;
        },
        setScore: function (director) {
            this.currentScore >>= 0;
            var str = '' + this.currentScore;
            while (str.length < 6) {
                str = '0' + str;
            }

            this.numbers = [];
            var i = 0;
            for (i = 0; i < str.length; i++) {
                this.numbers[i] = parseInt(str.charAt(i));
                this.childrenList[i].setAnimationImageIndex([this.numbers[i]]);
            }
        },
        animate: function (director, time) {
            if (time >= this.startTime && time < this.startTime + this.scoreDuration) {
                this.currentScore =
                        this.minScore +
                            this.incrementScore *
                            this.interpolator.getPosition((time - this.startTime) / this.scoreDuration).y;
                this.setScore(director);

            } else {
                if (this.currentScore != this.maxScore) {
                    this.currentScore = this.maxScore;
                    this.setScore(director);
                }
            }

            return VK.CAAT.ScoreActor.superclass.animate.call(this, director, time);
        }
    };

    extend(VK.CAAT.ScoreActor, CAAT.ActorContainer);

})();