//acá voy a implementar el canal de notificaciones in-app, guarda notificaciones en la base de datos

import type { Notification } from "../../models/interfaces/notification.interface.js";
import type { INotificationRepository } from "../../repository/interfaces/INotificationRepository.js";
import type { INotifier } from "./INotifier.js";

export class InAppNotifier implements INotifier {
//instancia del repositorio 
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}


  //recibe la notificacion y la guarda mediante el repositorio 
  async send(notification: Notification): Promise<void> {
    await this.notificationRepository.save(notification);
  }
}