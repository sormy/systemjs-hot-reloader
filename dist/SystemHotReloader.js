'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('core-js/shim');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SystemHotReloader = function () {
  /**
   * Constructor.
   *
   * @param {Object} options
   * @prop  {Object} loader   SystemJS instance, default to SystemJS || System
   * @prop  {Number} logLevel 0 - none, 1 - error, 2 - info (default), 3 - debug
   */
  function SystemHotReloader(options) {
    _classCallCheck(this, SystemHotReloader);

    var opts = options || {};

    this.loader = opts.loader || SystemJS || System;

    if (!this.loader) {
      throw new Error('Unable to instantiate SystemJS Hot Reloader without SystemJS');
    }

    if (this.loader.hotReloaderOptions) {
      Object.assign(opts, this.loader.hotReloaderOptions);
    }

    this.logLevel = opts.logLevel === undefined ? 2 : opts.logLevel;

    this.logger = this.createLogger('HMR');
  }

  /**
   * Create logger.
   */


  _createClass(SystemHotReloader, [{
    key: 'createLogger',
    value: function createLogger(prefix) {
      var _this = this;

      return {
        debug: function debug(message) {
          if (_this.logLevel >= 3 && console && console.debug) {
            console.debug('[' + prefix + '] ' + message);
          }
        },
        info: function info(message) {
          if (_this.logLevel >= 2 && console && console.info) {
            console.info('[' + prefix + '] ' + message);
          }
        },
        error: function error(message) {
          if (_this.logLevel >= 1 && console && console.warn) {
            console.warn('[' + prefix + '] ' + message);
          }
        }
      };
    }

    /**
     * Resolve module file path to module name.
     */

  }, {
    key: 'resolvePath',
    value: function resolvePath(path) {
      // try obvious resolve filename.ext => filename.ext
      var name1 = this.loader.normalizeSync(path);
      if (this.loader.get(name1)) {
        return name1;
      }

      // try less obvious resolve filename.ext => filename.ext!
      var name2 = this.loader.normalizeSync(path + '!');
      if (this.loader.get(name2)) {
        return name2;
      }

      // try to find by filename path in all registered modules, slow :-(
      var name3 = Object.keys(this.loader._loader.modules).find(function (name) {
        return name.startsWith(name1 + '!');
      });
      if (name3) {
        return name3;
      }

      return undefined;
    }

    /**
     * Reload module by file path.
     */

  }, {
    key: 'reloadPath',
    value: function reloadPath(path) {
      this.logger.debug('Reloading file: ' + path);

      var name = this.resolvePath(path);

      if (name) {
        return this.reloadModule(name);
      }

      // we did not find module :-(
      this.logger.info('Nothing to update');
      return Promise.resolve();
    }

    /**
     * Clean full module name from useless base url prefix and loader related suffix.
     */

  }, {
    key: 'cleanName',
    value: function cleanName(name) {
      // remove base url prefix
      if (name.startsWith(this.loader.baseURL)) {
        name = './' + name.substr(this.loader.baseURL.length);
      }

      // remove loader related garbage
      return name.replace(/!.*$/, '');
    }

    /**
     * Reload module by full module name.
     */

  }, {
    key: 'reloadModule',
    value: function reloadModule(moduleName) {
      var _this2 = this;

      var startTime = window.performance.now();

      this.logger.info('Reloading module ' + this.cleanName(moduleName));

      if (!this.loader.get(moduleName)) {
        this.logger.info('Nothing to update');
        return Promise.resolve();
      }

      var moduleChain = this.getReloadChain([moduleName]);
      var moduleBackups = {};

      return Promise.resolve().then(function () {
        _this2.logger.debug('Reload chain:');
        moduleChain.forEach(function (name) {
          _this2.logger.debug(' - ' + _this2.cleanName(name));
        });
      }).then(function () {
        _this2.logger.debug('Saving backup');
        moduleChain.forEach(function (name) {
          moduleBackups[name] = _this2.getModuleBackup(name);
        });
      }).then(function () {
        var promise = Promise.resolve();
        moduleChain.forEach(function (name) {
          promise = promise.then(function () {
            return _this2.reloadModuleInstance(name, moduleChain);
          });
        });
        return promise;
      }).then(function () {
        if (moduleChain.length) {
          _this2.logger.info('Updated modules:');
          moduleChain.forEach(function (name) {
            var exports = _this2.loader.get(name);
            var options = [];
            if (exports && exports.__reload) {
              options.push('__reload()');
            } else if (exports && exports.__unload) {
              options.push('__unload()');
            }
            var suffix = options.length ? '{ ' + options.join(', ') + ' }' : '';
            _this2.logger.info(' - ' + _this2.cleanName(name) + ' ' + suffix);
          });
        } else {
          _this2.logger.info('Nothing to update');
        }

        var time = (window.performance.now() - startTime) / 1000;
        var timeSecRound = Math.floor(time * 100) / 100;
        _this2.logger.info('Reload took ' + timeSecRound + ' sec');
      }).catch(function (error) {
        if (error) {
          var realError = error.originalErr || error;
          _this2.logger.error(realError.stack || realError);
        }

        _this2.logger.error('An error occured during reloading. Reverting...');

        var promise = Promise.resolve();

        moduleChain.forEach(function (name) {
          promise = promise.then(function () {
            return _this2.reloadModuleInstance(name, moduleChain, moduleBackups[name]);
          });
        });

        promise = promise.then(function () {
          _this2.logger.info('Application state was restored');
        });

        return promise;
      }).catch(function (error) {
        if (error) {
          _this2.logger.error(error.stack || error);
        }
        _this2.logger.error('An unrecoverable error occured during reverting');
      });
    }

    /**
     * Reload module instance with option to reload from backup.
     */

  }, {
    key: 'reloadModuleInstance',
    value: function reloadModuleInstance(name, moduleChain, backup) {
      var _this3 = this;

      var exports = backup ? backup.exports : this.loader.get(name);

      var unload = exports ? exports.__unload : undefined;
      var reload = exports ? exports.__reload : undefined;

      if (reload) {
        return Promise.resolve().then(function () {
          return _this3.fixModuleDeps(name);
        }).then(function () {
          _this3.logger.debug('Calling module ' + _this3.cleanName(name) + ' __reload() hook');
          return reload(moduleChain);
        });
      }

      return Promise.resolve().then(function () {
        if (!unload) {
          return undefined;
        }
        _this3.logger.debug('Calling module ' + _this3.cleanName(name) + ' unload() hook');
        return unload(moduleChain);
      }).then(function () {
        return backup ? _this3.restoreModuleBackup(backup) : _this3.deleteModule(name);
      }).then(function () {
        return _this3.importModule(name);
      });
    }

    /**
     * Fix module dependencies before hooked reload.
     */

  }, {
    key: 'fixModuleDeps',
    value: function fixModuleDeps(name) {
      var _this4 = this;

      var moduleRecords = this.loader._loader.moduleRecords;

      var moduleRecord = moduleRecords[name];

      moduleRecord.dependencies.forEach(function (depModuleRecord, index) {
        if (!depModuleRecord) {
          return;
        }

        var newDepModuleRecord = moduleRecords[depModuleRecord.name];

        if (!newDepModuleRecord) {
          return;
        }

        if (newDepModuleRecord !== depModuleRecord) {
          _this4.logger.debug('Fixing dependency ' + _this4.cleanName(depModuleRecord.name) + ' for module ' + _this4.cleanName(moduleRecord.name));

          moduleRecord.setters[index](newDepModuleRecord.exports);

          if (moduleRecord.dependencies[index] !== newDepModuleRecord.exports) {
            moduleRecord.dependencies[index] = newDepModuleRecord;
          }

          var impRecord = newDepModuleRecord.importers.find(function (record) {
            return record && record.name === moduleRecord;
          });
          if (!impRecord) {
            newDepModuleRecord.importers.push(moduleRecord);
          }
        }
      });
    }

    /**
     * Import module.
     */

  }, {
    key: 'importModule',
    value: function importModule(name) {
      this.logger.debug('Importing module ' + this.cleanName(name));
      return this.loader.import(name);
    }

    /**
     * Delete module and fix importers for dependencies.
     */

  }, {
    key: 'deleteModule',
    value: function deleteModule(name) {
      var _this5 = this;

      var moduleRecord = this.loader._loader.moduleRecords[name];

      if (moduleRecord) {
        moduleRecord.dependencies.forEach(function (depModuleRecord) {
          if (!depModuleRecord) {
            return;
          }
          depModuleRecord.importers.forEach(function (impModuleRecord, index) {
            if (impModuleRecord && moduleRecord.name === impModuleRecord.name) {
              _this5.logger.debug('Removing importer ' + _this5.cleanName(impModuleRecord.name) + ' from module ' + _this5.cleanName(depModuleRecord.name));
              depModuleRecord.importers.splice(index, 1);
            }
          });
        });
      }

      this.logger.debug('Removing module ' + this.cleanName(name));
      this.loader.delete(name);
    }

    /**
     * Get module backup which could be used to restore module state.
     */

  }, {
    key: 'getModuleBackup',
    value: function getModuleBackup(name) {
      var exports = this.loader.get(name);
      var record = this.loader._loader.moduleRecords[name];
      return { name: name, record: record, exports: exports };
    }

    /**
     * Restore module from backup.
     */

  }, {
    key: 'restoreModuleBackup',
    value: function restoreModuleBackup(data) {
      this.loader.set(data.name, data.exports);
      this.loader._loader.moduleRecords[data.name] = data.record;
    }

    /**
     * Get shortest distance to the root module (root modules have no importers).
     */

  }, {
    key: 'getModuleDistanceToRoot',
    value: function getModuleDistanceToRoot(name, record, cache) {
      var _this6 = this;

      var distance = void 0;
      if (cache[name] !== undefined) {
        return cache[name];
      }
      if (!record || !record.importers.length) {
        distance = 0;
      } else {
        distance = record.importers.reduce(function (result, impRecord) {
          var impDistance = 1 + _this6.getModuleDistanceToRoot(impRecord.name, impRecord, cache);
          return result === null ? impDistance : Math.min(result, impDistance);
        }, null);
      }
      cache[name] = distance;
      return distance;
    }

    /**
     * Reduce dependency tree and return modules in the order they should be reloaded.
     */

  }, {
    key: 'getReloadChain',
    value: function getReloadChain(modules, cache) {
      var _this7 = this;

      if (modules.length === 0) {
        return modules;
      }

      var records = this.loader._loader.moduleRecords;

      if (!cache) {
        cache = {};
      }

      var farNode = modules.reduce(function (result, name, index) {
        var record = records[name] ? records[name] : undefined;
        var distance = _this7.getModuleDistanceToRoot(name, record, cache);
        var importers = !record ? [] : record.importers.map(function (item) {
          return item.name;
        });
        var reload = record && record.exports && record.exports.__reload;
        var meta = { distance: distance, index: index, name: name, importers: importers, reload: reload };
        if (result === undefined) {
          return meta;
        }
        return result.distance >= distance ? result : meta;
      }, undefined);

      var nextModules = modules.slice(0);
      nextModules.splice(farNode.index, 1);
      if (!farNode.reload) {
        farNode.importers.forEach(function (name) {
          if (nextModules.indexOf(name) === -1) {
            nextModules.push(name);
          }
        });
      }

      var nextResult = this.getReloadChain(nextModules, cache);

      var result = [farNode.name].concat(nextResult);

      return result;
    }
  }]);

  return SystemHotReloader;
}();

exports.default = SystemHotReloader;
//# sourceMappingURL=SystemHotReloader.js.map