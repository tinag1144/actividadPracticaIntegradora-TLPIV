//acá implemento el factory method para centralizar la creacion de los disintos canales de notificacion 

import type { NotifierChannel } from "../../models/interfaces/notification.interface.js";
import type { INotificationRepository } from "../../repository/interfaces/INotificationRepository.js";
import type { INotifier } from "./INotifier.js";
import { InAppNotifier } from "./InAppNotifier.js";
import { ConsoleNotifierAdapter } from "./ConsoleNotifierAdapter.js";

export class NotifierFactory {

  //instancia del repositorio para guardar las notificaciones en mongo
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  create(channel: NotifierChannel): INotifier {

    // Si el canal pedido es "inapp",
    // creamos un InAppNotifier.
    //
    // Le pasamos el repositorio porque este canal necesita guardar
    // la notificación en la base de datos.
    if (channel === "inapp") {
      return new InAppNotifier(this.notificationRepository); //le paso el repositorio porq el canal necesita guardar la notif en la bd
    }

    return new ConsoleNotifierAdapter(); //y acá no necesita repositorio porque lo unico que hace es transformar la notificacion en texto y la imprime por consola
  }
}