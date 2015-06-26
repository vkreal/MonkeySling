/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    VK.InGameMenu = {
        id: (new Date()).getTime(),
        init: function () {

        },
        showPauseButton: function () {
            if (!this.m_InGamePauseButton) {
                var container = VK.DOM.getContainer();
                this.m_InGamePauseButton = VK.DOM.createDiv(null, "ingame-btn-pause", container);
                var me = this;
                VK.DOM.Event.onPointerDown(this.m_InGamePauseButton, function (e) {
                    if (!VK.GameHelper.getCurrent().checkLevelCompleteRULE()) {
                        VK.GameHelper.getCurrent().pause();
                        me.showBasicMenu();
                    }
                    //new VK.LevelCompleteDOM();
                });
            }
            this.m_InGamePauseButton.style.display = '';
        },
        hidePauseButton: function () {
            if (this.m_InGamePauseButton) {
                this.m_InGamePauseButton.style.display = 'none';
            }
        },
        showBasicMenu: function (options) {
            if (!this.m_InGameBasicMenuContainer) {

                this.m_InGameBasicMenuContainer = VK.DOM.createDiv(null, "ingame-container fill", VK.DOM.getContainer());
                this.m_InGameBasicMenuContainer.style.display = 'none';
                // shadow
                VK.DOM.createDiv(null, "ingame-shadow fill", this.m_InGameBasicMenuContainer);
                // menu items shadow
                VK.DOM.createDiv(null, "ingame-menu-items-wrapper ingame-menu-items-shadow", this.m_InGameBasicMenuContainer);
                var menuItemsWrapper = VK.DOM.createDiv(null, "ingame-menu-items-wrapper", this.m_InGameBasicMenuContainer);

                var sb = [''];
                sb.push('<table width=100% height=100% border=0 cellpadding=0 cellspacing=0>');
                sb.push('<tr>');
                sb.push('<td align=center valign=middle id="level' + this.id + '"></td>');
                sb.push('</tr>');
                sb.push('<tr>');
                sb.push('<td align=center valign=middle style="height:100%">');
                sb.push('<div class="ingame-btn-play" id="play' + this.id + '"></div>');
                sb.push('<div style="margin-top: 20px;" class="ingame-btn-refresh" id="refresh' + this.id + '"></div>');

                if (!VK.GameHelper.getSharedLevelId()) {
                    sb.push('<div style="margin-top: 20px;" class="ingame-btn-main" id="main' + this.id + '"></div>');
                }

                if (VK.GameHelper.isMusicEnabled()) {
                    sb.push('<div style="margin-top: 20px;" class="ingame-btn-music" id="music' + this.id + '"></div>');
                }
                else {
                    sb.push('<div style="margin-top: 20px;" class="ingame-btn-music-off" id="music' + this.id + '"></div>');
                }
                sb.push('</td>');
                sb.push('</tr>');
                sb.push('</table>');

                VK.DOM.setInnerHTML(menuItemsWrapper, sb.join(''));
                
                var byId = function (id) {
                    return document.getElementById(id);
                };
                var me = this;
                VK.DOM.Event.onPointerDown(byId('music' + this.id), function (e) {
                    this.toggleMusicButton(e.target);
                }.bind(this));

                
                PubSub.subscribe(VK.CONSTANT.PUBSUB.INGAME_TOGGLE_MUSIC_BUTTON, this, function (options) {
                    if (options.caller !== me) {
                        var el = document.getElementById('music' + me.id);
                        if (el) {
                            if (VK.GameHelper.isMusicEnabled()) {
                                el.className = 'ingame-btn-music';

                            }
                            else {
                                el.className = 'ingame-btn-music-off';
                            }
                        }
                    }
                });

                VK.DOM.Event.onPointerDown(byId('play' + this.id), function (e) {
                    VK.GameHelper.getCurrent().unpause();
                    me.hideBasicMenu();
                });
                VK.DOM.Event.onPointerDown(byId('refresh' + this.id), function (e) {
                    me.hideBasicMenu();
                    //(function () {
                        VK.GameHelper.getCurrent().restartGame();
                    //}).defer(); 
                });
                var main = byId('main' + this.id);
                if (main) {
                    VK.DOM.Event.onPointerUp(main, function (e) {
                        //VK.DOM.Event.cancelBubble(e);
                        me.hideBasicMenu();
                        me.hidePauseButton();
                        VK.DOM.PreventDefaultManipulationAndMouseEvent(e);
                        VK.GameHelper.showLevelSet();
                        PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_PLAY_LEVEL_BACKGROUND_SOUND, { play: false });
                    });
                }
            }
            jQuery(this.m_InGameBasicMenuContainer).fadeIn('slow', function () {
                // Animation complete
            });
            //this.m_InGameBasicMenuContainer.style.display = '';
        },
        toggleMusicButton: function (el, publish) {
            if (!el) { return; }
            if (VK.GameHelper.isMusicEnabled()) {
                el.className = 'ingame-btn-music-off';
               
                VK.GameHelper.setMusicEnabled('N');
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, { isMusicEnabled: false });
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_TOGGLE_MUSIC_BUTTON, { isMusicEnabled: false, caller: this });
            }
            else {
                el.className = 'ingame-btn-music';
              
                VK.GameHelper.setMusicEnabled('Y');
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_ENABLED_SOUND, { isMusicEnabled: true });
                PubSub.publish(VK.CONSTANT.PUBSUB.INGAME_TOGGLE_MUSIC_BUTTON, { isMusicEnabled: true, caller: this });
               
            }
        },
        hideBasicMenu: function () {
            this.m_InGameBasicMenuContainer.style.display = 'none';
        }
    };
    VK.InGameMenu.init();
})();