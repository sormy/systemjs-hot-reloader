System.register(['./SocketListener'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var SocketListener_1;
    var BrowserSyncListener;
    return {
        setters:[
            function (SocketListener_1_1) {
                SocketListener_1 = SocketListener_1_1;
            }],
        execute: function() {
            BrowserSyncListener = (function (_super) {
                __extends(BrowserSyncListener, _super);
                function BrowserSyncListener(options) {
                    _super.call(this);
                    Object.assign(this, { eventName: 'system:change', eventPath: 'path' }, options);
                }
                BrowserSyncListener.prototype.attach = function (callback) {
                    var _this = this;
                    return this.waitForBrowserSyncReady()
                        .then(function (bs) { return _this.socket = bs.socket; })
                        .then(function () { return _super.prototype.attach.call(_this, callback); });
                };
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
                return BrowserSyncListener;
            }(SocketListener_1.SocketListener));
            exports_1("BrowserSyncListener", BrowserSyncListener);
        }
    }
});
