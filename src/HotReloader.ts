import { ReloadPluginInterface } from './ReloadPluginInterface';
import { EventListenerInterface, EventListenerCallback } from './EventListenerInterface';

interface MySystemJS extends SystemJSLoader.System {
  normalizeSync: Function;
  _loader: any;
}

declare var SystemJS: MySystemJS;

export interface HotReloaderOptionsInterface {
  plugins?: ReloadPluginInterface[];
  listeners?: EventListenerInterface[];
  debug?: boolean;
}

export class HotReloader {
  private listeners: EventListenerInterface[] = [];
  private plugins: ReloadPluginInterface[] = [];
  private debug: boolean = false;

  constructor(options?: HotReloaderOptionsInterface) {
    Object.assign(this, options);
  }

  public log(message: string) {
    if (this.debug) {
      console.log(message);
    }
  }

  public attach() {
    this.log(`Attaching hot reloader`);
    return Promise.all(this.listeners.map((listener) => listener.attach(this.reloadFile.bind(this))))
      .then(() => Promise.all(this.plugins.map((plugin) => plugin.attach())));
  }

  public reloadFile(path: string) {
    this.log(`Reloading file: ${path}`);
    return this.reloadModule(SystemJS.normalizeSync(path));
  }

  public reloadModule(moduleName: string) {
    this.log(`Reloading module: ${moduleName}`);

    if (!SystemJS.get(moduleName)) {
      this.log(`Module ${moduleName} was not reloaded because it was not loaded`);
      return;
    }

    // TODO: what should we do with multiple root modules?

    let relatedModules = this.findRelatedModules(moduleName);
    let rootModuleName = relatedModules[relatedModules.length - 1];

    let supportedPlugins = this.plugins
      .filter((plugin) => plugin.supports(moduleName));

    let moduleBackup = this.saveModuleBackup(relatedModules);

    return Promise.all(supportedPlugins.map((plugin) => plugin.beforeReload()))
      .then(() => {
        this.log(`Removing ${relatedModules.length} module(s): ${relatedModules.join(', ')}`);
        relatedModules.forEach((moduleName) => SystemJS.delete(moduleName));
      })
      .then(() => {
        this.log(`Importing root module: ${rootModuleName}`);
        return SystemJS.import(rootModuleName);
      })
      .catch(() => {
        this.log(`Unable to import module, reverting...'`);
        this.loadModuleBackup(moduleBackup);
        return SystemJS.import(rootModuleName);
      })
      .then(() => Promise.all(supportedPlugins.map((plugin) => plugin.afterReload())));
  }

  private saveModuleBackup(list: string[]) {
    return list.reduce((result: any, moduleName: string) => {
      result[moduleName] = {
        exports: SystemJS.get(moduleName),
        record: SystemJS._loader.moduleRecords[moduleName]
      };
      return result;
    }, {});
  }

  private loadModuleBackup(state: any) {
    for (let moduleName in state) {
      let data = state[moduleName];
      SystemJS.set(moduleName, data.exports);
      SystemJS._loader.moduleRecords[moduleName] = data.record;
    }
  }

  private findRelatedModules(moduleName: string) {
    var moduleRecords = SystemJS._loader.moduleRecords;
    var result = [moduleName];
    var importers = moduleRecords[moduleName] ? moduleRecords[moduleName].importers : [];
    importers.forEach((module: any) => {
      result = result.concat(this.findRelatedModules(module.name));
    });
    return result;
  }
}

export default HotReloader;
