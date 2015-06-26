
(function () {
    var LevelSharedId = null;
    var MobileServices = new Microsoft.WindowsAzure.MobileServices.MobileServiceClient(
        "https://vorun.azure-mobile.net/",
        "HMAcbWZSlzXESCNWRFFEFBKrfPLYdD66"
    );
    var SharedLevelService = MobileServices.getTable("SharedLevel");
    
    ////'http://localhost:2624/services/sharedLevelService.ashx';
    //var service = new SharedLevelService('https://kreal1.azurewebsites.net/services/sharedLevelService.ashx');

    var ROOT_URL = 'https://kreal1.azurewebsites.net/monkeysling/';
    var UserDisplayName = "anonymnous";

    Windows.System.UserProfile.UserInformation.getDisplayNameAsync().then(
        function (name) {
            UserDisplayName = name;
        }
    );

    var OFFLINE_MESSAGE = "You are not be connected to the internet. Please try again when connected.";

    PubSub.subscribe('/share/level/', window, function (args) {
        var callback = args['callback'];
        var levelJson = args['levelJson'];
        var sharedId = args['sharedId'];
        LevelSharedId = null;
        
        if (!navigator.onLine) {
            var msg = new Windows.UI.Popups.MessageDialog(OFFLINE_MESSAGE, "Oops...");
            msg.showAsync();
            return;
        }

        var save_callback = function (response) {
            if (response && response.id /*response.result && response.result !== -1*/) {
                LevelSharedId = response.id; //response.result;//

                if (!sharedId) {
                    // show share new item
                    showShareUI();
                }
            }
            else {
                var errorMsg = "We are dispatching our highly trained monkeys to figure this out. Please try again later.";
                if (!navigator.onLine) {
                    errorMsg = OFFLINE_MESSAGE;
                }
                var msg = new Windows.UI.Popups.MessageDialog(errorMsg, "Oops...");
                msg.showAsync();
            }
            callback(LevelSharedId);
        };

        
        
        if (!sharedId) {
            //service.addOrUpdate(sharedId, JSON.stringify(levelJson), UserDisplayName, save_callback);

            SharedLevelService.insert({
                levelJson: JSON.stringify(levelJson),
                userDisplayName: UserDisplayName
            }).done(save_callback);
        }
        else {
            // show share old item already shared at least once
            LevelSharedId = sharedId;
            showShareUI(sharedId);
            //service.addOrUpdate(sharedId, JSON.stringify(levelJson), UserDisplayName, save_callback);
            SharedLevelService.update({
                levelJson: JSON.stringify(levelJson),
                userDisplayName: UserDisplayName,
                id: sharedId
            }).done(save_callback);
        }

        // 1. save
        // 2. get level id
        // 3. share //http://msdn.microsoft.com/en-us/library/windows/apps/Hh758312
        // http://msdn.microsoft.com/en-us/library/windows/apps/hh465261.aspx
    });

    function showShareUI() {
        if (LevelSharedId) {
            Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
        }
    }

    function dataRequested(e) {
        //debugger;
        var request = e.request;

        request.data.properties.title = 'Monkey Sling';
        //request.data.properties.description = 'Created by Monkey Sling level designer';
        request.data.properties.description = 'I created this level in Monkey Sling. Tap the link on your device to open Monkey Sling and get the banana!';
        // uVjx27xsu50u
        request.data.setUri(new Windows.Foundation.Uri(ROOT_URL + "?sharedId=" + LevelSharedId + "&dt=" + (new Date()).getTime()));

        LevelSharedId = null;

        // Title is required
        //var dataPackageTitle = document.getElementById("titleInputBox").value;
        //if ((typeof dataPackageTitle === "string") && (dataPackageTitle !== "")) {
        //    var dataPackageLink = document.getElementById("linkInputBox").value;
        //    if ((typeof dataPackageLink === "string") && (dataPackageLink !== "")) {
        //        request.data.properties.title = dataPackageTitle;

        //        // The description is optional.
        //        var dataPackageDescription = document.getElementById("descriptionInputBox").value;
        //        if ((typeof dataPackageDescription === "string") && (dataPackageDescription !== "")) {
        //            request.data.properties.description = dataPackageDescription;
        //        }
        //        try {
        //            request.data.setUri(new Windows.Foundation.Uri(document.getElementById("linkInputBox").value));
        //            WinJS.log && WinJS.log("", "sample", "error");
        //        } catch (ex) {
        //            WinJS.log && WinJS.log("Exception occured: the uri provided " + dataPackageLink + " is not well formatted.", "sample", "error");
        //        }
        //    } else {
        //        request.failWithDisplayText("Enter the text you would like to share and try again.");
        //    }
        //} else {
        //    request.failWithDisplayText(SdkSample.missingTitleError);
        //}
    }



    WinJS.Application.addEventListener("activated", function (eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
                dataTransferManager.addEventListener("datarequested", dataRequested);
            }));
        }
    }, false);
})();