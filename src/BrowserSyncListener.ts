import { SocketListener } from './SocketListener';
import { EventListenerCallback } from './EventListenerInterface';

type BrowserSyncInterface = {
  socket: SocketIOClient.Socket
};

interface MyWindow extends Window {
  ___browserSync___: BrowserSyncInterface;
}

declare var window: MyWindow;

export interface BrowserSyncListenerOptionInterface {
  eventName?: string;
  eventPath?: string;
}

export class BrowserSyncListener extends SocketListener {
  constructor(options?: BrowserSyncListenerOptionInterface) {
    super();
    Object.assign(this, { eventName: 'system:change', eventPath: 'path' }, options);
  }

  public attach(callback: EventListenerCallback) {
    return this.waitForBrowserSyncReady()
      .then((bs: BrowserSyncInterface) => this.socket = bs.socket)
      .then(() => super.attach(callback));
  }

  private waitForBrowserSyncReady() {
    return new Promise<BrowserSyncInterface>((resolve) => {
      let bs = window.___browserSync___;
      if (bs) {
        resolve(bs);
      } else {
        let bsCheck = setInterval(() => {
          let bs = window.___browserSync___;
          if (bs) {
            clearInterval(bsCheck);
            resolve(bs);
          }
        }, 500);
      }
    });
  }
}
