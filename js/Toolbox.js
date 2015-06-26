/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

(function () {

    VK.Toolbox = Class.extend({
        h: VK.GameHelper.getBottomWallHeight(),
        active: true,
        _lastGoodLeft: 0,
        render: function (left, top, zoom) {
            if (isNaN(top) || top == null || top == undefined) {
                top = 0;
            }
            if (isNaN(left) || left == null || left == undefined) {
                left = this._lastGoodLeft;
            }
            this._lastGoodLeft = left;
            this.content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
            this.content.style.marginTop = top ? (-top / zoom) + 'px' : '';
            this.content.style.zoom = zoom || '';
        },
        isActive: function () {
            return this.active;
        },
        createGarbageCan: function () {
            //            var p = VK.DOM.getContainer();
            //            this.toolbox_garbage = VK.DOM.createDiv('', 'toolbox-garbage', p);

            //            this.addListener(VK.DOM.Event.Type.onPointerMove, this.toolbox_garbage, function (e) {
            //                //console.debug(new Date().getTime());
            //            });
        },
        hide: function (fadeOut) {
            if (fadeOut) {
                jQuery(this.toolboxbody).fadeOut('slow', function () { });
            }
            else {
                this.toolboxbody.style.display = 'none';
            }
            this.active = false;
        },
        show: function () {
            jQuery(this.toolboxbody).fadeIn('slow', function () { });
            //this.toolboxbody.style.display = '';
            this.active = true;
        },
        setDesigner: function (designer) {
            this.designer = designer;

            this.designer.onTouchMoveAfter = function (options) {
                if (options && options.entity &&
                    options.entity.ENTITY_DESIGN_STATE == VK.CONSTANT.ENTITY_DESIGN_STATE.DELETE_CANDIDATE) {
                    this.trashcan.src = VK.APPLICATION_ROOT + 'assets/ingame/trashcan_on.png';
                }
                else if (this.trashcan.src.indexOf('trashcan_on') != -1) {
                    this.trashcan.src = VK.APPLICATION_ROOT + 'assets/ingame/trashcan.png';
                }
            }.bind(this);

            this.designer.onTouchEndAfter = function (options) {
                if (this.trashcan.src.indexOf('trashcan_on') != -1) {
                    this.trashcan.src = VK.APPLICATION_ROOT + 'assets/ingame/trashcan.png';
                }
            }.bind(this);

            /// disable/enable entities function
            this.resolveAvailableEntities(designer);

        },
        resolveAvailableEntities: function (designer) {
            // assume widget been init already

            // TODO: loop through count element and add count here lookup

            // show all items and than hide what we need to hide
            var elements = this.toolboxbody.getElementsByClassName('tool-item-outer');
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = 'inline-block';
            }



            var tracker = designer.getInstanceTracker();

            for (var typeName in tracker) {
                if (tracker[typeName].instancesTotal) {
                    var className = 'tool-item-wrapper' + typeName;
                    var dom = this.toolboxbody.getElementsByClassName(className)[0];
                    if (dom) {
                        if (tracker[typeName].count >= tracker[typeName].instancesTotal) {
                            // cant create anymore entity type
                            dom.style.display = 'none';
                        }
                        else {
                            dom.style.display = 'inline-block';
                            //var el = this.toolboxbody.getElementsByClassName('tool-item-' + typeName + 'count')[0];
                            //el.style.display = '';
                            //VK.DOM.setInnerHTML(el, tracker[typeName].instancesTotal - tracker[typeName].count);
                        }
                    }
                }
            }
        },
        init: function (options) {
            this.set(options);

            var p = VK.DOM.getContainer();

            this.toolboxbody = VK.DOM.createDiv('', 'toolbox-body', p);
            this.toolboxbody.style.height = this.h + 'px';

            VK.DOM.createDiv('', 'toolbox-shadow', this.toolboxbody);

            var tick = (new Date()).getTime();

            var sb = [
                '<table class="fill" border=0 style="borderXXX:1px solid green; top:0px; left:0px; position:absolute;">',
                    '<tr>',
                        '<td  style="width:150px;" align=center valign=middle><div style="width:100px;"><img id="trashcan' + tick + '" src="' + VK.APPLICATION_ROOT + 'assets/ingame/trashcan.png" /></div></td>',
                        '<td style="width:100%;">',
                            '<div style="width:100%; overflow:hidden; border-radius: 20px; background-color: #fff; opacity: 0.6; height: ' + (this.h - 20) + 'px;" id="toolbox-container-' + (tick) + '">',
                            '</div>',
                        '</td>',
                        '<td style="width:150px;" align=center valign=middle><div style="width:100px;"><img id="theme_btn_picker' + tick + '" src="' + VK.APPLICATION_ROOT + 'assets/ingame/theme_btn_picker.png" /></div></td>',
                    '</tr>',
                '</table>'
            ];//http://www.iconarchive.com/show/tulliana-2-icons-by-umut-pulat/image-icon.html


            var wrapper = VK.DOM.createDiv('', '', this.toolboxbody);


            VK.DOM.setInnerHTML(wrapper, sb.join(''));


            this.container = document.getElementById('toolbox-container-' + tick);


            // 200 == 100 left / 100 right of toolbar
            this.container.style.width = (VK.DOM.getCanvasSize().w - 200) + 'px';


            var that = this;

            PubSub.subscribe("/viewState/change/", this, function (args) {
                if (args['view'] !== 'snapped') {
                    that.container.style.width = (args['availableWidth'] - 200) + 'px';
                }
            });

            this.scroller = new Scroller(this.render.bind(this), {
                scrollingY: false
                //paging: true
            });
            var rect = this.container.getBoundingClientRect();



            this.xtypes = VK.GameHelper.getToolboxXtypesAsArray();

            var type_count = this.xtypes.length;

            var toolItemSize = 125;

            this.content = VK.DOM.createDiv('', 'toolbox-content', this.container);
            this.content.style.width = ((type_count + 1) * toolItemSize) + "px";
            //this.content.style.border = '3px solid yellow'

            var frag = document.createDocumentFragment();



            for (var j = 0; j < type_count; j++) {
                var type = this.xtypes[j];
                var typeName = type.name;
                if (type.toolbarIcon == undefined) {
                    //var xx = new type.clazz({ b2World: null, x: 0, y: 0, isDesignMode: true });
                    // cache it as part of typeInfo
                    //type.toolbarIcon = xx.getToolbarIcon();

                    type.toolbarIcon = VK.APPLICATION_ROOT + 'assets/designer/' + typeName + '.png';
                }
                var id = 'tool-item-' + typeName;

                elem = document.createElement("div");
                elem.style.borderRight = '1px solid silver'
                elem.style.width = toolItemSize + "px";
                elem.style.height = this.h + "px";
                elem.style.display = "inline-block";
                elem.style.textIndent = "6px";
                elem.className = 'tool-item-outer tool-item-wrapper' + typeName;

                var sb = ["<table border=0 typeIndex={0} style='width:100%; height:100%; font-size:10px;' cellpadding=0 cellspacing=0><tr typeIndex={0}><td typeIndex={0} valign=middle align=center>"];
                sb.push('<div typeIndex={0} style="position:relative;">');
                sb.push('<span typeIndex={0} class="' + id + 'count" style="display:none; position:absolute; top:-20px; right:0px; background-color:blue; color:#fff; border-radius: 40px; font-size:24px;">');
                sb.push('</span>');
                if (type.toolbarIcon) {
                    sb.push("<img typeIndex={0} title='{1}' class='");
                    sb.push(id);
                    sb.push("' style='max-width:100px; max-height: 50px;' />");
                }
                else {
                    sb.push(type.name);
                }
                sb.push("</div></td></tr></table>");
                VK.DOM.setInnerHTML(elem, String.format(sb.join(''), j, typeName));
                frag.appendChild(elem);

                if (type.toolbarIcon) {
                    var img = elem.getElementsByClassName(id)[0];
                    if (img) {
                        //img.src = type.toolbarIcon.toDataURL();
                        img.src = type.toolbarIcon;
                    }
                }
            }
            this.content.appendChild(frag);


            this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);
            this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);


            var container = this.container;
            var scroller = this.scroller;
            var me = this;

            var mousedown = null;

            var fingerCount = 0,
                start = { x: 0, y: 0 },
                end = { x: 0, y: 0 },
                delta = { x: 0, y: 0 },
                fingers = 1,
                threshold = 75,
                scrolling = false;

            this.trashcan = document.getElementById('trashcan' + tick);

            this.addListener(VK.DOM.Event.Type.onPointerDown, document.getElementById('theme_btn_picker' + tick), function (e) {
                var nextTheme = VK.GameHelper.getNextTheme(this.designer.getTheme().id);
                this.designer.setTheme(nextTheme.id);
                this.designer.setupTheme();
            }.bind(this));

            this.addListener(VK.DOM.Event.Type.onPointerDown, container, function (e) {
                /* measure */
                start.x = end.x = e.pageX;
                start.y = end.y = e.pageY;
                /* end measure */

                scrolling = false;

                e.preventDefault();
                scroller.doTouchStart([{
                    pageX: e.pageX,
                    pageY: e.pageY
                }], e.timeStamp);

                var typeIndex = parseInt(e.target.getAttribute('typeIndex'));
                mousedown = { added: false, typeIndex: typeIndex };
            });

            var me = this;

            this.addListener(VK.DOM.Event.Type.onPointerMove, document, function (e) {
                e.preventDefault();
                if (!mousedown || !me.isActive()) {
                    return;
                }
                //                console.debug('move: ' + (new Date()).getTime())
                /* measure */
                end.x = e.pageX;
                end.y = e.pageY;

                var d = Math.round(Math.sqrt(Math.pow(end.y - start.y, 2)))

                if (!scrolling && start.y > end.y && d >= threshold && !mousedown.added) {
                    scrolling = false;
                    // hide toolbar when creating new entity
                    //me.hide();
                    if (mousedown.typeIndex == undefined || isNaN(mousedown.typeIndex)) {
                        return;
                    }
                    var xtypeInfo = me.xtypes[mousedown.typeIndex];
                    if (!xtypeInfo) {
                        throw new Error("can't find xtypeInfo in toolbox!");
                    }
                    else {
                        me.designer.onTouchStartToolbox(e, xtypeInfo);
                        mousedown.added = true;
                    }
                    distance = 0;
                }
                else if (!mousedown || !mousedown.added) {
                    /* end measure */
                    // if distance further than threshold
                    var d2 = Math.round(Math.sqrt(Math.pow(end.x - start.x, 2)/* + Math.pow(end.y - start.y, 2)*/));
                    if (d2 >= threshold) {
                        scrolling = true;
                    }
                    scroller.doTouchMove([{
                        pageX: e.pageX,
                        pageY: e.pageY
                    }], e.timeStamp);
                }
                //mousedown = true;
            });
            this.addListener(VK.DOM.Event.Type.onPointerCancel, document, function (e) {
                e.preventDefault();
                if (!mousedown) {
                    return;
                }

                /* measure */
                fingerCount = 0;

                start.x = 0;
                start.y = 0;
                end.x = 0;
                end.y = 0;
                delta.x = 0;
                delta.y = 0;


                /* end measure */

                scroller.doTouchEnd(e.timeStamp);
                mousedown = null;

                me.show();
            });
            this.addListener(VK.DOM.Event.Type.onPointerUp, document, function (e) {
                e.preventDefault();
                if (!mousedown || !me.isActive()) {
                    return;
                }

                /* measure */
                //distance = calculateDistance();

                //if (validateSwipeDistance()) {
                //}
                /* end measure */

                scroller.doTouchEnd(e.timeStamp);
                me.show();
                mousedown = null;
            });

        }
    });

    VK.Toolbox.getToolbox = function (designer) {
        if (!VK.Toolbox.__toolbox) {
            VK.Toolbox.__toolbox = new VK.Toolbox();
        }
        VK.Toolbox.__toolbox.setDesigner(designer);
        return VK.Toolbox.__toolbox;
    };

})();

