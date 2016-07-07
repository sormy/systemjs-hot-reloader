import { IEventListener } from './IEventListener';
export interface IBrowserSyncListenerOptions {
    eventName?: string;
    eventPath?: string;
}
export declare class BrowserSyncListener implements IEventListener {
    reloader: any;
    private options;
    private onChange;
    constructor(options?: IBrowserSyncListenerOptions);
    attach(): Promise<void>;
    detach(): Promise<void>;
    private waitForBrowserSyncReady();
    private getEventPath();
    private getEventName();
}
