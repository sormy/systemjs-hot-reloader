import { ReloadPluginInterface } from './ReloadPluginInterface';
import { EventListenerInterface } from './EventListenerInterface';
export interface HotReloaderOptionsInterface {
    plugins?: ReloadPluginInterface[];
    listeners?: EventListenerInterface[];
    debug?: boolean;
}
export declare class HotReloader {
    private listeners;
    private plugins;
    private debug;
    constructor(options?: HotReloaderOptionsInterface);
    log(message: string): void;
    attach(): Promise<Promise<void>[]>;
    reloadFile(path: string): Promise<Promise<void>[]>;
    reloadModule(moduleName: string): Promise<Promise<void>[]>;
    private saveModuleBackup(list);
    private loadModuleBackup(state);
    private findRelatedModules(moduleName);
}
export default HotReloader;
