import type { Notification } from "../../models/interfaces/notification.interface.js";

//contrato que deben cumplir todos los canales de notificación
export interface INotifier {
  //cada canal recibe una notificación y se encarga de enviarla
  send(notification: Notification): Promise<void>;
}