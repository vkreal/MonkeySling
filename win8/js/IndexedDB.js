(function () {
    var DB_VERSION = 1;
    WinJS.Namespace.define("WinJSVK", {
        dbName: 'MyLevels' + DB_VERSION,
        db: null
    });

    function createDB() {
        // Create the request to open the database, named BookDB. If it doesn't exist, create it and immediately 
        // upgrade to version 1. 
        var dbRequest = window.indexedDB.open(WinJSVK.dbName, 1);

        // Add asynchronous callback functions 
        dbRequest.onerror = function () { WinJS.log && WinJS.log("Error creating database.", WinJSVK.dbName, "error"); };
        dbRequest.onsuccess = function (evt) { dbSuccess(evt); };
        dbRequest.onupgradeneeded = function (evt) { dbVersionUpgrade(evt); };
        dbRequest.onblocked = function () { WinJS.log && WinJS.log("Database create blocked.", WinJSVK.dbName, "error"); };

    }
    function deleteDB() {
        // Close and clear the handle to the database, held in the parent WinJSVK namespace. 
        if (WinJSVK.db) {
            WinJSVK.db.close();
        }
        WinJSVK.db = null;
        var dbRequest = window.indexedDB.deleteDatabase(WinJSVK.dbName);
        dbRequest.onerror = function () { WinJS.log && WinJS.log("Error deleting database.", WinJSVK.dbName, "error"); };
        dbRequest.onsuccess = function () { WinJS.log && WinJS.log("Database deleted.", WinJSVK.dbName, "status"); };
        dbRequest.onblocked = function () {
            WinJS.log && WinJS.log("Database delete blocked.", WinJSVK.dbName, "error");
        };
    }
    function dbVersionUpgrade(evt) {
        // If the database was previously loaded, close it.  
        // Closing the database keeps it from becoming blocked for later delete operations. 
        if (WinJSVK.db) {
            WinJSVK.db.close();
        }
        var db = evt.target.result;
        // Get the version update transaction handle, since we want to create the schema as part of the same transaction. 
        var txn = evt.target.transaction;

        var levelStore = db.createObjectStore("level", { keyPath: "id" });
        levelStore.createIndex("id", "id", { unique: true });
        
        // Once the creation of the object stores is finished (they are created asynchronously), log success. 
        txn.oncomplete = function () { WinJS.log && WinJS.log("Database schema created.", WinJSVK.dbName, "status"); };
    }
    function dbSuccess(evt) {
        if (WinJSVK.db) {
            WinJSVK.db.close();
        }
        WinJSVK.db = evt.target.result;
    }

    WinJSVK.deleteDB = function () {
        // Close and clear the handle to the database, held in the parent SdkSample namespace. 
        if (WinJSVK.db) {
            WinJSVK.db.close();
        }
        WinJSVK.db = null;
        var dbRequest = window.indexedDB.deleteDatabase(WinJSVK.dbName);
        dbRequest.onerror = function () { WinJS.log && WinJS.log("Error deleting database.", "sample", "error"); };
        dbRequest.onsuccess = function () {
            createDB();
            WinJS.log && WinJS.log("Database deleted.", "sample", "status");
        };
        dbRequest.onblocked = function () {
            WinJS.log && WinJS.log("Database delete blocked.", "sample", "error");
        };
    };

    WinJSVK.addOrUpdate = function (levelObject, callback) {
        var db = WinJSVK.db;
        var trans = db.transaction(["level"], "readwrite");
        var store = trans.objectStore("level");
        var request = store.put(levelObject);

        request.onsuccess = function (e) {
            WinJSVK.getAllEntries(function (levels) {
                if (callback) {
                    callback(levels);
                }
            });
        };
        request.onerror = function (e) {
            console.log('Error adding: ' + e);
        };
    };

    WinJSVK.delete = function (id, callback) {
        var db = WinJSVK.db;
        var trans = db.transaction(["level"], "readwrite");
        var store = trans.objectStore("level");
        var request = store.delete(id);

        request.onsuccess = function (e) {
            WinJSVK.getAllEntries(function (levels) {
                if (callback) {
                    callback(levels);
                }
            });
        };
        request.onerror = function (e) {
            console.log('Error adding: ' + e);
        };
    };

    WinJSVK.getAllEntries = function (callback) {
        
        var levels = [];

        var db = WinJSVK.db;
        var txn = db.transaction("level", "readonly");
        txn.oncomplete = function () {
            callback(levels);
        };

        var levelCursorRequest = txn.objectStore("level").index("id").openCursor(); 
 
        // As each record is returned (asynchronously), the cursor calls the onsuccess event; we store that data in our books array 
        levelCursorRequest.onsuccess = function (e) { 
            var cursor = e.target.result; 
            if (cursor) { 
                levels.push(cursor.value); 
                cursor.continue(); 
            } 
        };
    };

    WinJSVK.getLevelById = function (id, callback) {
        var db = WinJSVK.db;
        var trans = db.transaction(["level"], "readwrite");
        var store = trans.objectStore("level");
        var index = store.index("id");

        index.get(id).onsuccess = function (e) {
            callback(e.target.result); 
        };
    };

    PubSub.subscribe('/designer/clear/', window, function (args) {
        WinJSVK.deleteDB();
    });

    // add or update a level
    PubSub.subscribe('/mylevel/addOrUpdate/', window, function (args) {
        var callback = args['callback'];
        var levelJson = args['levelJson'];
        var sharedId = args['sharedId'];
        
        WinJSVK.addOrUpdate(levelJson, function (levels) {
            if (callback) {
                callback(levels);
            }
        });
    });

    // get all levels
    PubSub.subscribe('/mylevel/getLevels/', window, function (args) {
        var callback = args['callback'];
        WinJSVK.getAllEntries(function (levels) {
            callback(levels);
        });
    });

    // get a level by id
    PubSub.subscribe('/mylevel/getLevel/', window, function (args) {
        var callback = args['callback'];
        var id = args['id'];
        WinJSVK.getLevelById(id, callback);
    });

    // delete a level
    PubSub.subscribe('/mylevel/delete/', window, function (args) {
        var callback = args['callback'];
        var id = args['id'];
        WinJSVK.delete(id, callback);
    });
    
    // clear all levels
    PubSub.subscribe('/mylevel/clear/', window, function (args) {
        WinJSVK.deleteDB();
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        createDB();
    }, false);

})();