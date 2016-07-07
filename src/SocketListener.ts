import socketIO from 'socket.io-client';

import { IEventListener } from './IEventListener';

export interface ISocketListenerOptions {
  eventName?: string;
  eventPath?: string;
  socket: SocketIOClient.Socket;
}

export class SocketListener implements IEventListener {
  public reloader: any;
  private onChange: Function;

  constructor(private options: ISocketListenerOptions) {}

  public attach() {
    this.onChange = (event: any) => {
      this.reloader.reloadFile(event[this.getEventPath()]);
    };

    return new Promise<void>((resolve) => {
      this.options.socket.on(this.getEventName(), this.onChange);
      resolve();
    });
  }

  public detach() {
    return new Promise<void>((resolve) => {
      this.options.socket.off(this.getEventName(), this.onChange);
      resolve();
    });
  }

  private getEventPath() {
    return this.options.eventPath || 'path';
  }

  private getEventName() {
    return this.options.eventName || 'change';
  }
}
