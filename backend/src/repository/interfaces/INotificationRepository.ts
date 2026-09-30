//acá defino el contrato del repositorio de notificaciones 

import type { Notification } from "./notification.interface.js";

export interface INotificationRepository {

    //guarda una nueva notificacion
    save(notification: Notification): Promise<Notification>; 

    //devuelve las notificaciones de un usuario 
    findByUserId(userId: string): Promise<Notification[]>;

    //contar las notificaciones  no leidas que tiene el user
    countUnreadNotif(userId: string): Promise<number>

    //marcar una notificacion como leida
    markAsRead(notificationId: string, userId: string): Promise<Notification | null>; //esto significa que puede devolver la notificacion actualizada o no devolver nada de no existir una notificacipon con ese id 



}