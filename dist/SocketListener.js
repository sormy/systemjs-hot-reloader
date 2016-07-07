System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var SocketListener;
    return {
        setters:[],
        execute: function() {
            SocketListener = (function () {
                function SocketListener(options) {
                    this.options = options;
                }
                SocketListener.prototype.attach = function () {
                    var _this = this;
                    this.onChange = function (event) {
                        _this.reloader.reloadFile(event[_this.getEventPath()]);
                    };
                    return new Promise(function (resolve) {
                        _this.options.socket.on(_this.getEventName(), _this.onChange);
                        resolve();
                    });
                };
                SocketListener.prototype.detach = function () {
                    var _this = this;
                    return new Promise(function (resolve) {
                        _this.options.socket.off(_this.getEventName(), _this.onChange);
                        resolve();
                    });
                };
                SocketListener.prototype.getEventPath = function () {
                    return this.options.eventPath || 'path';
                };
                SocketListener.prototype.getEventName = function () {
                    return this.options.eventName || 'change';
                };
                return SocketListener;
            }());
            exports_1("SocketListener", SocketListener);
        }
    }
});
