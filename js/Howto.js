/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    VK.Howto = {};
    
    VK.Howto.show = function (template, onPointerDownHandler) {
        
        var wrapper = VK.DOM.createDiv(null, "fill", VK.DOM.getContainer());

        var shadow = VK.DOM.createDiv(null, "ingame-shadow fill", wrapper);

        shadow.style.position = 'absolute';
        shadow.style.top = '0px'
        shadow.style.zIndex = 99;
        
        var el = VK.DOM.createDiv(null, "fill", wrapper);

        VK.DOM.setInnerHTML(el, template);

        var btn = el.getElementsByClassName('tutorial-intro-ok')[0];

        var evt = VK.DOM.Event.onPointerDown(btn, function (e) {
            VK.DOM.Event.removeEventOnPointer(VK.DOM.Event.Type.onPointerDown, btn, evt);
            jQuery(wrapper).fadeOut('slow', function () { onPointerDownHandler(); });
            
        });
    };


    var howto_play_template = [
    '<table class="fill tutorial-intro-wrapper" style="position:absolute; top:0px;">',
        '<tr>',
            '<td align="center" valign="top">',
                '<div class="tutorial-intro" style="margin-top:' + (VK.isWinJS() ? '30' : '20') + 'px; height:450px !important;">',
                    '<table class="fill" border="0" cellspacing=0 cellpadding=0>',
                        '<tr>',
                            '<td align="center" valign="top">',
                                '<div class="tutorial-intro-titlebar"></div>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td align="center"> ',
                                '<span class="tutorial-intro-number">1</span>',
                                '<span>PULL BACK</span>',
                                '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/monkey.png"/>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td align="center">',
                                '<span class="tutorial-intro-number">2</span>',
                                '<span>Aim for stars and bonuses</span>',
                                '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/star.png" width="56" height="56"/>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td align="center">',
                                '<span class="tutorial-intro-number">3</span>',
                                '<span>Get the banana!</span>',
                                '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/banana.png"/>',
                            '</td>',
                        '</tr>',
                        '<tr>',
                            '<td align="center">',
                                VK.isWinJS() ? '<br/><div style="font-size:24px; color:blue;">Complete first level to unlock "My Levels"!</div>' : '',
                                '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/ok.png" style="' + (VK.isWinJS() ? '' : 'margin-top:90px;') + '" class="tutorial-intro-ok"/>',
                            '</td>',
                        '</tr>',
                    '</table>',
                '</div>',
            '</td>',
        '</tr>',
    '</table>'];


    var firstTimePlayStoreKey = 'vk-howto-play';

    VK.Howto.isFirstTimePlay = function () {
        if (localStorage.getItem(firstTimePlayStoreKey) && !VK.isDebugMode()) {
            return false;
        }
        return true;
    };
    VK.Howto.showHowtoPlay = function (callback) {
        if (!VK.Howto.isFirstTimePlay()) {
            callback(); return;
        }
        VK.Howto.show(howto_play_template.join(''), function () {
            localStorage.setItem(firstTimePlayStoreKey, 1);
            callback();
        });
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    var howto_create1_template = [
         '<table class="fill tutorial-intro-wrapper" style="position:absolute; top:0px;">',
            '<tr>',
                '<td align="center" valign="top">',
                    '<div class="tutorial-intro" style="margin-top:30px; height:500px !important;">',
                        '<table class="fill" border="0" cellspacing=0 cellpadding=0>',
                            '<tr>',
                                '<td align="center" valign="top" colspan="3">',
                                    '<div class="tutorial-intro-titlebar">',
                                    '</div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<div style="margin-top:20px;"></div> ',
                                    '<span>create level</span>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<div style="margin-top:20px;"></div>', 
                                    '<span class="tutorial-intro-number">&nbsp</span>',
                                    '<span>Move one or more items from toolbox</span>',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/toolbox.png"/>',
                                '</td>',
                            '</tr>',
                             '<tr>',
                                '<td align="center">',
                                    '<span class="tutorial-intro-number">&nbsp</span>',
                                    '<span>Tap to run level</span>',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/run.png" width="64" height="64"/>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<span class="tutorial-intro-number">&nbsp</span>',
                                    '<span>Tab theme picker to change world</span>',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/ingame/theme_btn_picker.png"/>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<span class="tutorial-intro-number">&nbsp</span>',
                                    '<span>Move items to trash can to remove</span>',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/ingame/trashcan.png"/>',
                                '</td>',
                            '</tr>',
                             '<tr>',
                                '<td align="center">',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/ok.png" style="" class="tutorial-intro-ok"/>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
               '</td>',
            '</tr>',
        '</table>'];

    var howto_create2_template = [
         '<table class="fill tutorial-intro-wrapper" style="position:absolute; top:0px;">',
            '<tr>',
                '<td align="center" valign="top">',
                    '<div class="tutorial-intro" style="margin-top:30px; height:450px !important;">',
                        '<table class="fill" border="0" cellspacing=0 cellpadding=0>',
                            '<tr>',
                                '<td align="center" valign="top" colspan="3">',
                                    '<div class="tutorial-intro-titlebar">',
                                    '</div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<div style="margin-top:20px;"></div> ',
                                    '<span>share my level</span>',
                                '</td>',
                            '</tr>',
                             '<tr>',
                                '<td align="center">',
                                    '<div style="margin-top:20px;"></div> ',
                                    '<span class="tutorial-intro-number">1</span>',
                                    '<span>Create a level</span>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<div style="margin-top:20px;"></div> ',
                                    '<span class="tutorial-intro-number">2</span>',
                                    '<span>Complete level with banana</span>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<div style="margin-top:20px;"></div> ',
                                    '<span class="tutorial-intro-number">3</span>',
                                    '<span>Tap share!</span>',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/share.png" width="64" height="64"/>',
                                '</td>',
                            '</tr>',
                             '<tr>',
                                '<td align="center">',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/ok.png" style="margin-top:50px;" class="tutorial-intro-ok"/>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</td>',
            '</tr>',
        '</table>'];
    
    var firstTimeCreateStoreKey = 'vk-howto-create';

    VK.Howto.isFirstTimeCreate = function () {
        if (localStorage.getItem(firstTimeCreateStoreKey) && !VK.isDebugMode()) {
            return false;
        }
        return true;
    };
    VK.Howto.showHowtoCreate = function (callback) {
        if (!VK.Howto.isFirstTimeCreate()) {
            callback(); return;
        }
        VK.Howto.show(howto_create1_template.join(''), function () {
            localStorage.setItem(firstTimeCreateStoreKey, 1);
            VK.Howto.showHowtoCreate2(callback);
        });
    };

    VK.Howto.showHowtoCreate2 = function (callback) {
        VK.Howto.show(howto_create2_template.join(''), function () {
            callback();
        });
    };


    ////////////////////////////////////////////////////////////////////////// BUY DIALOG /////////////////////////////////////////

    var howto_buy_template = [
         '<table class="fill tutorial-intro-wrapper" style="position:absolute; top:30px;">',
            '<tr>',
                '<td align="center" valign="top">',
                    '<div class="tutorial-intro" style="position:relative;">',
                        '<table class="fill" border="0" cellspacing=0 cellpadding=0>',
                            '<tr>',
                                '<td align="center" valign="top" colspan="3">',
                                    '<div class="tutorial-intro-titlebar">',
                                    '</div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/monkey_big.png"/>',
                                '</td>',
                            '</tr>',
                             '<tr>',
                                '<td align="center">',
                                    '<span>MANY NEW LEVELS!</span>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<span>UNLIMIT "MY LEVELS" AND SHARES!</span>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td align="center">',
                                    '<span>FREE UPDATES and no advertisement!</span>',
                                '</td>',
                            '</tr>',
                             '<tr>',
                                '<td align="center">',
                                    '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/buy_game_button1.png" style="margin-top:10px;" class="tutorial-intro-buy" />',
                                '</td>',
                            '</tr>',
                        '</table>',
                        '<img src="' + VK.APPLICATION_ROOT + 'assets/intro/close_button.png" style="position:absolute; right:0px; bottom:-50px;" class="tutorial-intro-close"/>',
                    '</div>',
                '</td>',
            '</tr>',
        '</table>'
    ];
    
    VK.Howto._showBuy = function (template, onPointerDownHandler) {

        var wrapper = VK.DOM.createDiv(null, "fill", VK.DOM.getContainer());

        var shadow = VK.DOM.createDiv(null, "ingame-shadow fill", wrapper);

        shadow.style.position = 'absolute';
        shadow.style.top = '0px'

        var el = VK.DOM.createDiv(null, "fill", wrapper);

        VK.DOM.setInnerHTML(el, template);

        var btn = el.getElementsByClassName('tutorial-intro-buy')[0];

        var evt = VK.DOM.Event.onPointerDown(btn, function (e) {
            VK.DOM.Event.removeEventOnPointer(VK.DOM.Event.Type.onPointerDown, btn, evt);
            wrapper.style.display = 'none';
            onPointerDownHandler();
        });


        // close button
        var btn2 = el.getElementsByClassName('tutorial-intro-close')[0];
        var closeEvt = VK.DOM.Event.onPointerDown(btn2, function (e) {
            VK.DOM.Event.removeEventOnPointer(VK.DOM.Event.Type.onPointerDown, btn2, closeEvt);
            wrapper.style.display = 'none';
        });
    };
    
    VK.Howto.showBuyDialog = function (callback) {
        VK.Howto._showBuy(howto_buy_template.join(''), function () {
            // call store buy api
            callback();
        });
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////
})();