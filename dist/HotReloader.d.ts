import { IReloadPlugin } from './IReloadPlugin';
import { IEventListener } from './IEventListener';
export interface IHotReloaderOptions {
    plugins?: IReloadPlugin[];
    listeners: IEventListener[];
    debug?: boolean;
}
export declare class HotReloader {
    private listeners;
    private plugins;
    private debug;
    constructor(options: IHotReloaderOptions);
    log(message: string): void;
    attach(): Promise<Promise<void>[]>;
    reloadFile(path: string): Promise<Promise<void>[]>;
    reloadModule(moduleName: string): Promise<Promise<void>[]>;
    private saveModuleBackup(list);
    private loadModuleBackup(state);
    private findRelatedModules(moduleName);
}
export default HotReloader;
