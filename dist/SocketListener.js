System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var SocketListener;
    return {
        setters:[],
        execute: function() {
            SocketListener = (function () {
                function SocketListener(options) {
                    this.eventName = 'change';
                    this.eventPath = 'path';
                    this.socket = null;
                    Object.assign(this, options);
                }
                SocketListener.prototype.attach = function (callback) {
                    var _this = this;
                    this.onChange = function (event) { return callback(event[_this.eventPath]); };
                    this.socket.on(this.eventName, this.onChange);
                    return Promise.resolve();
                };
                SocketListener.prototype.detach = function () {
                    this.socket.off(this.eventName, this.onChange);
                    return Promise.resolve();
                };
                return SocketListener;
            }());
            exports_1("SocketListener", SocketListener);
        }
    }
});
