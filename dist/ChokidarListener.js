System.register(['socket.io-client'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var socket_io_client_1;
    var ChokidarListener;
    return {
        setters:[
            function (socket_io_client_1_1) {
                socket_io_client_1 = socket_io_client_1_1;
            }],
        execute: function() {
            ChokidarListener = (function () {
                function ChokidarListener(options) {
                    this.options = typeof options === 'string' ? { url: options } : this.options;
                }
                ChokidarListener.prototype.attach = function () {
                    var _this = this;
                    this.onChange = function (event) {
                        _this.reloader.reloadFile(event[_this.getEventPath()]);
                    };
                    return new Promise(function (resolve) {
                        _this.socket = socket_io_client_1.default(_this.options.url);
                        _this.socket.on(_this.getEventName(), _this.onChange);
                        resolve();
                    });
                };
                ChokidarListener.prototype.detach = function () {
                    var _this = this;
                    return new Promise(function (resolve) {
                        _this.socket.close();
                        _this.socket = null;
                        resolve();
                    });
                };
                ChokidarListener.prototype.getEventPath = function () {
                    return this.options.eventPath || 'path';
                };
                ChokidarListener.prototype.getEventName = function () {
                    return this.options.eventName || 'change';
                };
                return ChokidarListener;
            }());
            exports_1("ChokidarListener", ChokidarListener);
        }
    }
});
