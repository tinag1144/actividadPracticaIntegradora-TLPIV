import type { ProductStatusChangedEvent } from "../types/index.js";
import type { IObserver } from "./IObserver.js";
import type { ISubject } from "./ISubject.js";

export class EventPublisher implements ISubject<ProductStatusChangedEvent> {
  private readonly observers = new Set<IObserver<ProductStatusChangedEvent>>();

  attach(observer: IObserver<ProductStatusChangedEvent>): void {
    this.observers.add(observer);
  }

  detach(observer: IObserver<ProductStatusChangedEvent>): void {
    this.observers.delete(observer);
  }

  async notify(event: ProductStatusChangedEvent): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.update(event);
      } catch (error) {
        console.error("Product status observer failed", error);
      }
    }
  }
}
