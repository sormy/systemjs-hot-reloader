import socketIO from 'socket.io-client';

import { IEventListener } from './IEventListener';

export interface IChokidarListenerOptions {
  eventName?: string;
  eventPath?: string;
  url: string;
}

export class ChokidarListener implements IEventListener {
  public reloader: any;

  private options: IChokidarListenerOptions;
  private socket: SocketIOClient.Socket;
  private onChange: Function;

  constructor(options: IChokidarListenerOptions | string) {
    this.options = typeof options === 'string' ? { url: options } : this.options;
  }

  public attach() {
    this.onChange = (event: any) => {
      this.reloader.reloadFile(event[this.getEventPath()]);
    };

    return new Promise<void>((resolve) => {
      this.socket = socketIO(this.options.url);
      this.socket.on(this.getEventName(), this.onChange);
      resolve();
    });
  }

  public detach() {
    return new Promise<void>((resolve) => {
      this.socket.close();
      this.socket = null;
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
