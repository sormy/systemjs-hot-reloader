import { IEventListener } from './IEventListener';
export interface ISocketListenerOptions {
    eventName?: string;
    eventPath?: string;
    socket: SocketIOClient.Socket;
}
export declare class SocketListener implements IEventListener {
    private options;
    reloader: any;
    private onChange;
    constructor(options: ISocketListenerOptions);
    attach(): Promise<void>;
    detach(): Promise<void>;
    private getEventPath();
    private getEventName();
}
