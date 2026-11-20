export interface IObserver<T> {
  update(event: T): Promise<void>;
}
