System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var BrowserSyncListener;
    return {
        setters:[],
        execute: function() {
            BrowserSyncListener = (function () {
                function BrowserSyncListener(options) {
                    this.options = options || {};
                }
                BrowserSyncListener.prototype.attach = function () {
                    var _this = this;
                    this.onChange = function (event) {
                        _this.reloader.reloadFile(event[_this.getEventPath()]);
                    };
                    return this.waitForBrowserSyncReady()
                        .then(function (bs) {
                        bs.socket.on(_this.getEventName(), _this.onChange);
                    });
                };
                BrowserSyncListener.prototype.detach = function () {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var bs = window.___browserSync___;
                        bs.socket.off(_this.getEventName(), _this.onChange);
                        resolve();
                    });
                };
                ;
                BrowserSyncListener.prototype.waitForBrowserSyncReady = function () {
                    return new Promise(function (resolve) {
                        var bs = window.___browserSync___;
                        if (bs) {
                            resolve(bs);
                        }
                        else {
                            var bsCheck_1 = setInterval(function () {
                                var bs = window.___browserSync___;
                                if (bs) {
                                    clearInterval(bsCheck_1);
                                    resolve(bs);
                                }
                            }, 500);
                        }
                    });
                };
                BrowserSyncListener.prototype.getEventPath = function () {
                    return this.options.eventPath || 'path';
                };
                BrowserSyncListener.prototype.getEventName = function () {
                    return this.options.eventName || 'system:change';
                };
                return BrowserSyncListener;
            }());
            exports_1("BrowserSyncListener", BrowserSyncListener);
        }
    }
});
