import { IEventListener } from './IEventListener';

type IBrowserSync = any;

interface MyWindow extends Window {
  ___browserSync___: IBrowserSync;
}

declare var window: MyWindow;

export interface IBrowserSyncListenerOptions {
  eventName?: string;
  eventPath?: string;
}

export class BrowserSyncListener implements IEventListener {
  public reloader: any;

  private options: IBrowserSyncListenerOptions;
  private onChange: Function;

  constructor(options?: IBrowserSyncListenerOptions) {
    this.options = options || {};
  }

  public attach() {
    this.onChange = (event: any) => {
      this.reloader.reloadFile(event[this.getEventPath()]);
    };

    return this.waitForBrowserSyncReady()
      .then((bs: IBrowserSync) => {
        bs.socket.on(this.getEventName(), this.onChange);
      });
  }

  public detach() {
    return new Promise<void>((resolve) => {
      let bs = window.___browserSync___;
      bs.socket.off(this.getEventName(), this.onChange);
      resolve();
    });
  };

  private waitForBrowserSyncReady() {
    return new Promise<IBrowserSync>((resolve) => {
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

  private getEventPath() {
    return this.options.eventPath || 'path';
  }

  private getEventName() {
    return this.options.eventName || 'system:change';
  }
}
