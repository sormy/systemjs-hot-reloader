System.register(['./ChokidarListener', './SocketListener', './BrowserSyncListener', './KeepReactRootStatePlugin', './HotReloader'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters:[
            function (ChokidarListener_1_1) {
                exportStar_1(ChokidarListener_1_1);
            },
            function (SocketListener_1_1) {
                exportStar_1(SocketListener_1_1);
            },
            function (BrowserSyncListener_1_1) {
                exportStar_1(BrowserSyncListener_1_1);
            },
            function (KeepReactRootStatePlugin_1_1) {
                exportStar_1(KeepReactRootStatePlugin_1_1);
            },
            function (HotReloader_1_1) {
                exportStar_1(HotReloader_1_1);
            }],
        execute: function() {
        }
    }
});
