export type EventListenerCallback = (file: string) => void;

export interface EventListenerInterface {
  attach(callback: EventListenerCallback): Promise<void>;
  detach(): Promise<void>;
}
