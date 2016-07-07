import { IEventListener } from './IEventListener';
export interface IChokidarListenerOptions {
    eventName?: string;
    eventPath?: string;
    url: string;
}
export declare class ChokidarListener implements IEventListener {
    reloader: any;
    private options;
    private socket;
    private onChange;
    constructor(options: IChokidarListenerOptions | string);
    attach(): Promise<void>;
    detach(): Promise<void>;
    private getEventPath();
    private getEventName();
}
