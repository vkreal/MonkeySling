/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {
    
    /// VIEW STATE CHANGE

    if (VK.isWinJS()) {
        PubSub.subscribe("/viewState/change/", this, function (args) {
            var gs = VK.GameHelper.getCurrent();
            var w = window.document.documentElement.clientWidth;
            var canvas = VK.DOM.getCanvas();
            if (!canvas) {
                return;
            }
            jaws.width = w;
            //jaws.height
            canvas.width = w;
            canvas.style.width = w + 'px';
            jaws.clear();
            VK.DOM.getContainer().style.width = w + 'px';
            if (gs) {
                gs.resize(w, args);
            }
            VK.DOM.getCanvasOffset(true);

            if (gs && gs.centerAroundPlayer) {
                gs.centerAroundPlayer();
            }
        });
    }
    else {
        // TODO: MAYBE JUST TURN OFF SCROLLING???
        window.addEventListener("resize", function () {
            VK.DOM.getCanvasOffset(true);
        }, false);
    }
    // END VIEW STATE CHANGE

    /// License changed
    PubSub.subscribe("/store/licensechange/", this, function (args) {
        PubSub.publish(VK.CONSTANT.PUBSUB.TRIAL_CONVERSION_SUCCESS, {});
    });



    jaws.onload = function () {
        var w = window.document.documentElement.clientWidth;
        var h = window.document.documentElement.clientHeight;

        var canvas = document.getElementById('canvas');
        var container = document.getElementById('container');


        // HARDWARE SCALING
        //http://blogs.msdn.com/b/davrous/archive/2012/04/06/modernizing-your-html5-canvas-games-with-offline-apis-file-apis-css3-amp-hardware-scaling.aspx
        //var gameWidth = window.innerWidth;
        //var gameHeight = window.innerHeight;
        //var scaleToFitX = gameWidth / (1024 - 1024 * .4);
        //var scaleToFitY = gameHeight / (768 - 768 * .4);

        //var currentScreenRatio = gameWidth / gameHeight;
        //var optimalRatio = Math.min(scaleToFitX, scaleToFitY);

        //if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) {
        //    canvas.style.width = gameWidth + "px";
        //    canvas.style.height = gameHeight + "px";
        //}
        //else {
        //    canvas.style.width = (1024 - 1024 * .4) * optimalRatio + "px";
        //    canvas.style.height = (768 - 768 * .4) * optimalRatio + "px";
        //}



        if (VK.isWinJS()) {
            PubSub.publish("/viewState/get/", function (viewStates) {
                //w = viewStates['availableWidth']
                canvas.width = w;
                container.style.width = w + 'px';
            });
            canvas.height = h;
            container.style.height = h + 'px';

        }
        else {//1024x576 http://gmc.yoyogames.com/index.php?showtopic=543453
            // TODO: REVISIT WHEN WE DO SCALING!!!!

            //canvas.width = 1366;
            //container.style.width = '1366px';

            canvas.width = 1024;
            container.style.width = '1024px';
            if (window.innerHeight >= 768) {
                canvas.height = 768;
                container.style.height = '768px';
            }
            else {
                canvas.height = 576;
                container.style.height = '576px';
            }
        }
        //else {
        //    canvas.width = 760;
        //    container.style.width = '760px';

        //    canvas.height = 600;
        //    container.style.height = '600px';
        //}

        jaws.unpack();

        jaws.assets.root = VK.APPLICATION_ROOT;

        jaws.assets.add(VK.Resources.URL_MAP);
        //var t = new VK.PlayMonkeySling(); //PlayMonkeySling

        var menu = new VK.IntroBase();

        if (VK.GameHelper.getUrlParameterByName('dt') == 'y') {
            jaws.start(VK.TestDesigner, { fps: 60 });
        }
        else {
            jaws.start(menu, { fps: 60 });  // Our convenience function jaws.start() will load assets, call setup and loop update/draw in 60 FPS
        }
    };

})();