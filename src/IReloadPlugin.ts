export interface IReloadPlugin {
  attach(): Promise<void>;
  supports(moduleName: string): boolean;
  beforeReload(): Promise<void>;
  afterReload(): Promise<void>;
}
