import { EventListenerInterface, EventListenerCallback } from './EventListenerInterface';

export interface SocketListenerOptionsInterface {
  eventName?: string;
  eventPath?: string;
  socket?: SocketIOClient.Socket;
}

export class SocketListener implements EventListenerInterface {
  public eventName: string = 'change';
  public eventPath: string = 'path';
  public socket: SocketIOClient.Socket = null;

  protected onChange: Function;

  constructor(options?: SocketListenerOptionsInterface) {
    Object.assign(this, options);
  }

  public attach(callback: EventListenerCallback) {
    this.onChange = (event: any) => callback(event[this.eventPath]);
    this.socket.on(this.eventName, this.onChange);
    return Promise.resolve();
  }

  public detach() {
    this.socket.off(this.eventName, this.onChange);
    return Promise.resolve();
  }
}
