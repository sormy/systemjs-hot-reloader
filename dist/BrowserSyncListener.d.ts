import { SocketListener } from './SocketListener';
import { EventListenerCallback } from './EventListenerInterface';
export interface BrowserSyncListenerOptionInterface {
    eventName?: string;
    eventPath?: string;
}
export declare class BrowserSyncListener extends SocketListener {
    constructor(options?: BrowserSyncListenerOptionInterface);
    attach(callback: EventListenerCallback): Promise<void>;
    private waitForBrowserSyncReady();
}
