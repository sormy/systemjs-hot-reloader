import { ReloadPluginInterface } from './ReloadPluginInterface';
export declare class KeepReactRootStatePlugin implements ReloadPluginInterface {
    private reactHookData;
    private rootStates;
    attach(): Promise<void>;
    supports(moduleName: string): boolean;
    beforeReload(): Promise<void>;
    afterReload(): Promise<void>;
    private saveReactRootState();
    private loadReactRootState();
    private installHook();
    private getClosestComponentInstanceFromNode(node);
    private getReactNodeState(node);
    private getReactRootNodes();
}
