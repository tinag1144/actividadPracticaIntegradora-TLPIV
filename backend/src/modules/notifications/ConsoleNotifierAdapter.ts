
//acá implemento el patrón adapter (adapto la consola para que muestre el mensaja que se mostraría usando el metodo send() )
import type { Notification } from "../../models/interfaces/notification.interface.js";
import type { INotifier } from "./INotifier.js";

export class ConsoleNotifierAdapter implements INotifier {

  async send(notification: Notification): Promise<void> {  //mantengo el promise porque aunque el console.log no sea asincrono, los canales deben compartir la misma interfaz

    //convierto la notificacion en un texto legible y luego lo muestro en el console.log
    const message =
      `[NOTIFICACIÓN] Para: ${notification.userEmail} | ` +
      `Producto: ${notification.productName} | ` +
      `Estado: ${notification.oldStatus} → ${notification.newStatus}`;

    console.log(message);
  }
}