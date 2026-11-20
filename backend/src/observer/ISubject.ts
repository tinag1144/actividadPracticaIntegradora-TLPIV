import type { IObserver } from "./IObserver.js";

export interface ISubject<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(event: T): Promise<void>;
}
