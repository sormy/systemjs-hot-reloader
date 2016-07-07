System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var KeepReactRootStatePlugin;
    return {
        setters:[],
        execute: function() {
            KeepReactRootStatePlugin = (function () {
                function KeepReactRootStatePlugin() {
                }
                KeepReactRootStatePlugin.prototype.attach = function () {
                    return this.installHook();
                };
                KeepReactRootStatePlugin.prototype.supports = function (moduleName) {
                    return /\.(tsx?|jsx?)(!|$)/.test(moduleName);
                };
                KeepReactRootStatePlugin.prototype.beforeReload = function () {
                    var _this = this;
                    return new Promise(function (resolve) {
                        _this.saveReactRootState();
                        resolve();
                    });
                };
                KeepReactRootStatePlugin.prototype.afterReload = function () {
                    var _this = this;
                    return new Promise(function (resolve) {
                        _this.loadReactRootState();
                        _this.rootStates = [];
                        resolve();
                    });
                };
                KeepReactRootStatePlugin.prototype.saveReactRootState = function () {
                    var _this = this;
                    this.rootStates = this.getReactRootNodes().map(function (rootNode) {
                        return _this.getReactNodeState(rootNode);
                    });
                };
                KeepReactRootStatePlugin.prototype.loadReactRootState = function () {
                    var _this = this;
                    this.getReactRootNodes().map(function (rootNode, index) {
                        var oldState = _this.rootStates[index];
                        if (oldState) {
                            var instance = _this.getClosestComponentInstanceFromNode(rootNode);
                            if (instance) {
                                instance.setState(oldState);
                            }
                        }
                    });
                };
                KeepReactRootStatePlugin.prototype.installHook = function () {
                    var _this = this;
                    return new Promise(function (resolve) {
                        if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { inject: function () { } };
                        }
                        var self = _this;
                        var oldInject = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject;
                        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function (hook) {
                            self.reactHook = hook;
                            return oldInject.apply(this, arguments);
                        };
                        resolve();
                    });
                };
                KeepReactRootStatePlugin.prototype.getClosestComponentInstanceFromNode = function (node) {
                    var internalInstance = this.reactHook.ComponentTree.getClosestInstanceFromNode(node);
                    return internalInstance._currentElement._owner._instance;
                };
                KeepReactRootStatePlugin.prototype.getReactNodeState = function (node) {
                    return this.getClosestComponentInstanceFromNode(node).state;
                };
                KeepReactRootStatePlugin.prototype.getReactRootNodes = function () {
                    return [].slice.call(document.querySelectorAll('[data-reactroot]'));
                };
                return KeepReactRootStatePlugin;
            }());
            exports_1("KeepReactRootStatePlugin", KeepReactRootStatePlugin);
        }
    }
});