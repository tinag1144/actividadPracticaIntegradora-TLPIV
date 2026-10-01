//en este servicio se implementa el rol observer: cuando recibe el evento del cambio de estado de un producto busca a los usuarios suscriptos y los notifica por los dos canales disponibles 

import type { IObserver } from "../../observer/IObserver.js";
import type { ProductStatusChangedEvent } from "../../types/index.js";
import type { ISubscriptionRepository } from "../subscriptions/ISubscriptionRepository.js";
import type { IUserRepository } from "../../repositories/interfaces/IUserRepository.js";
import type { Notification } from "../../models/interfaces/notification.interface.js";
import { NotifierFactory } from "./NotifierFactory.js";
import type { INotificationRepository } from "../../repository/interfaces/INotificationRepository.js"; //agrego al repository pq ahora el service tambien va a necesitar consultar y modificar notificaciones ya guardadas en la bd

export class NotificationService
  implements IObserver<ProductStatusChangedEvent> //implementa Iobserver y observa eventos de tipo ProductStatusChangedEvent
{
  // el servicio no crea repositorios directamente
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly notifierFactory: NotifierFactory,
  ) {}

  //este método viene de IObserver, eventPublisher lo ejecutará cuando cambie el estado de un producto.
  async update(event: ProductStatusChangedEvent): Promise<void> {
    // primero busco todas las suscripciones asociadas al producto 
    const subscriptions =
      await this.subscriptionRepository.findByProductId(event.productId);

    //recorro todas las suscipciones 
    for (const subscription of subscriptions) {

      const user = await this.userRepository.findById(subscription.userId);

      if (!user) {
        continue; //si no encuentra el usuario, pasa al siguiente suscriptor 
      }

      // armo la notificacion con los datos del evento y del ususario 
      const notification: Notification = {
        userId: subscription.userId,
        userEmail: user.email,
        productId: event.productId,
        productName: event.productName,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        message:
          `El producto ${event.productName} cambió de estado ` +
          `de ${event.oldStatus} a ${event.newStatus}.`,
        read: false,
      };

      //el service le "pide" al factory la notificacion in-app
      const inAppNotifier = this.notifierFactory.create("inapp");

      //notificación se guarda en MongoDB.
      await inAppNotifier.send(notification);

      const consoleNotifier = this.notifierFactory.create("console"); //pide la  notificacion de console

      await consoleNotifier.send(notification); //la muestra
    }
  }

  //devuelve todas las notificaciones de un usuario.
async getByUserId(userId: string): Promise<Notification[]> {
  return this.notificationRepository.findByUserId(userId)
}

//devuelve la cantidad de notificaciones no leídas.
async countUnread(userId: string): Promise<number> {
  return this.notificationRepository.countUnreadNotif(userId)
}

//marca una notificación como leída.
async markAsRead( notificationId: string, userId: string,): Promise<Notification | null> {
  return this.notificationRepository.markAsRead( notificationId, userId );
}
}