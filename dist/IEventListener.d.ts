export interface IEventListener {
    reloader: any;
    attach(): Promise<void>;
    detach(): Promise<void>;
}
