System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var HotReloader;
    return {
        setters:[],
        execute: function() {
            HotReloader = (function () {
                function HotReloader(options) {
                    this.listeners = [];
                    this.plugins = [];
                    this.debug = false;
                    Object.assign(this, options);
                }
                HotReloader.prototype.log = function (message) {
                    if (this.debug) {
                        console.log(message);
                    }
                };
                HotReloader.prototype.attach = function () {
                    var _this = this;
                    this.log("Attaching hot reloader");
                    return Promise.all(this.listeners.map(function (listener) { return listener.attach(_this.reloadFile.bind(_this)); }))
                        .then(function () { return Promise.all(_this.plugins.map(function (plugin) { return plugin.attach(); })); });
                };
                HotReloader.prototype.reloadFile = function (path) {
                    this.log("Reloading file: " + path);
                    return this.reloadModule(SystemJS.normalizeSync(path));
                };
                HotReloader.prototype.reloadModule = function (moduleName) {
                    var _this = this;
                    this.log("Reloading module: " + moduleName);
                    if (!SystemJS.get(moduleName)) {
                        this.log("Module " + moduleName + " was not reloaded because it was not loaded");
                        return;
                    }
                    // TODO: what should we do with multiple root modules?
                    var relatedModules = this.findRelatedModules(moduleName);
                    var rootModuleName = relatedModules[relatedModules.length - 1];
                    var supportedPlugins = this.plugins
                        .filter(function (plugin) { return plugin.supports(moduleName); });
                    var moduleBackup = this.saveModuleBackup(relatedModules);
                    return Promise.all(supportedPlugins.map(function (plugin) { return plugin.beforeReload(); }))
                        .then(function () {
                        _this.log("Removing " + relatedModules.length + " module(s): " + relatedModules.join(', '));
                        relatedModules.forEach(function (moduleName) { return SystemJS.delete(moduleName); });
                    })
                        .then(function () {
                        _this.log("Importing root module: " + rootModuleName);
                        return SystemJS.import(rootModuleName);
                    })
                        .catch(function () {
                        _this.log("Unable to import module, reverting...'");
                        _this.loadModuleBackup(moduleBackup);
                        return SystemJS.import(rootModuleName);
                    })
                        .then(function () { return Promise.all(supportedPlugins.map(function (plugin) { return plugin.afterReload(); })); });
                };
                HotReloader.prototype.saveModuleBackup = function (list) {
                    return list.reduce(function (result, moduleName) {
                        result[moduleName] = {
                            exports: SystemJS.get(moduleName),
                            record: SystemJS._loader.moduleRecords[moduleName]
                        };
                        return result;
                    }, {});
                };
                HotReloader.prototype.loadModuleBackup = function (state) {
                    for (var moduleName in state) {
                        var data = state[moduleName];
                        SystemJS.set(moduleName, data.exports);
                        SystemJS._loader.moduleRecords[moduleName] = data.record;
                    }
                };
                HotReloader.prototype.findRelatedModules = function (moduleName) {
                    var _this = this;
                    var moduleRecords = SystemJS._loader.moduleRecords;
                    var result = [moduleName];
                    var importers = moduleRecords[moduleName] ? moduleRecords[moduleName].importers : [];
                    importers.forEach(function (module) {
                        result = result.concat(_this.findRelatedModules(module.name));
                    });
                    return result;
                };
                return HotReloader;
            }());
            exports_1("HotReloader", HotReloader);
            exports_1("default",HotReloader);
        }
    }
});
