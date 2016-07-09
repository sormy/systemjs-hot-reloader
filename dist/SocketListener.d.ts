import { EventListenerInterface, EventListenerCallback } from './EventListenerInterface';
export interface SocketListenerOptionsInterface {
    eventName?: string;
    eventPath?: string;
    socket?: SocketIOClient.Socket;
}
export declare class SocketListener implements EventListenerInterface {
    eventName: string;
    eventPath: string;
    socket: SocketIOClient.Socket;
    protected onChange: Function;
    constructor(options?: SocketListenerOptionsInterface);
    attach(callback: EventListenerCallback): Promise<void>;
    detach(): Promise<void>;
}
