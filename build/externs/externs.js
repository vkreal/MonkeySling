// extern Set causing some weird compiler runtime errors undefinded function
var Box2D = {
    Common: {
        b2Color: {
            "Set": function () { }
        }
    }
};

var Class = {
    '_super': function () { }
};

var soundManager = {
    'play': function () { }
};

var WinJS = {};

var GameManager = {};

var AppStore = {
    'isTrial': function () {},
    'doTrialConversion': function () { },
    'getLicenseInformation': function () { }
};

var SharedLevelService = {
    'getSharedPageLevels': function () { }
};
