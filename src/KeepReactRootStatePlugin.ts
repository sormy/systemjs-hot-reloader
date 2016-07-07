import { IReloadPlugin } from './IReloadPlugin';

type IReactDevToolsGlobalHook = any;

interface MyWindow extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__: IReactDevToolsGlobalHook;
}

declare var window: MyWindow;

export class KeepReactRootStatePlugin implements IReloadPlugin {
  private reactHook: IReactDevToolsGlobalHook;
  private rootStates: any[];

  public attach() {
    return this.installHook();
  }

  public supports(moduleName: string) {
    return /\.(tsx?|jsx?)(!|$)/.test(moduleName);
  }

  public beforeReload() {
    return new Promise<void>((resolve) => {
      this.saveReactRootState();
      resolve();
    });
  }

  public afterReload() {
    return new Promise<void>((resolve) => {
      this.loadReactRootState();
      this.rootStates = [];
      resolve();
    });
  }

  private saveReactRootState() {
    this.rootStates = this.getReactRootNodes().map((rootNode: Element) => {
      return this.getReactNodeState(rootNode);
    });
  }

  private loadReactRootState() {
    this.getReactRootNodes().map((rootNode: Element, index: number) => {
      let oldState = this.rootStates[index];
      if (oldState) {
        let instance = this.getClosestComponentInstanceFromNode(rootNode);
        if (instance) {
          instance.setState(oldState);
        }
      }
    });
  }

  private installHook() {
    return new Promise<void>((resolve) => {
      if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { inject: function() {} };
      }

      let self = this;
      let oldInject = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject;

      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function(hook: IReactDevToolsGlobalHook) {
        self.reactHook = hook;
        return oldInject.apply(this, arguments);
      };

      resolve();
    });
  }

  private getClosestComponentInstanceFromNode(node: Element) {
    var internalInstance = this.reactHook.ComponentTree.getClosestInstanceFromNode(node);
    return internalInstance._currentElement._owner._instance;
  }

  private getReactNodeState(node: Element) {
    return this.getClosestComponentInstanceFromNode(node).state;
  }

  private getReactRootNodes() {
    return [].slice.call(document.querySelectorAll('[data-reactroot]'));
  }
}
