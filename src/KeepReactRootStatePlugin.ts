import { ReloadPluginInterface } from './ReloadPluginInterface';

type ReactDevToolsGlobalHookDataInterface = any;

interface MyWindow extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__: ReactDevToolsGlobalHookDataInterface;
}

declare var window: MyWindow;

export class KeepReactRootStatePlugin implements ReloadPluginInterface {
  private reactHookData: ReactDevToolsGlobalHookDataInterface;
  private rootStates: any[];

  public attach() {
    return this.installHook();
  }

  public supports(moduleName: string) {
    return /\.(tsx?|jsx?)(!|$)/.test(moduleName);
  }

  public beforeReload() {
    this.saveReactRootState();
    return Promise.resolve();
  }

  public afterReload() {
    this.loadReactRootState();
    this.rootStates = [];
    return Promise.resolve();
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
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { inject: function() {} };
    }

    let self = this;
    let reactGlobalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    let oldInject = reactGlobalHook.inject;

    reactGlobalHook.inject = function(hookData: ReactDevToolsGlobalHookDataInterface) {
      self.reactHookData = hookData;
      return oldInject.apply(this, arguments);
    };

    return Promise.resolve();
  }

  private getClosestComponentInstanceFromNode(node: Element) {
    var internalInstance = this.reactHookData.ComponentTree.getClosestInstanceFromNode(node);
    return internalInstance._currentElement._owner._instance;
  }

  private getReactNodeState(node: Element) {
    return this.getClosestComponentInstanceFromNode(node).state;
  }

  private getReactRootNodes() {
    return [].slice.call(document.querySelectorAll('[data-reactroot]'));
  }
}
