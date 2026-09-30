//acá implemento el acceso a mongo para las notificaciones

import type { Notification } from "../models/interfaces/notification.interface.js";
import { NotificationModel } from "../models/notification.model.js";
import type { INotificationRepository } from "./interfaces/INotificationRepository.js";

export class NotificationRepository implements INotificationRepository {

  async save(notification: Notification): Promise<Notification> {
    const newNotif = await NotificationModel.create(notification);
    return newNotif;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifByUserId = await NotificationModel.find({ userId });
    return notifByUserId;
  }

  async countUnreadNotif(userId: string): Promise<number> {
    const unreadCount = await NotificationModel.countDocuments({ userId, read: false, });
    return unreadCount;
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    const updatedNotification = await NotificationModel.findOneAndUpdate(
    {
      _id: notificationId,
      userId,
    },
    {
      read: true,
    },
    {
      new: true,
    },
  );

  return updatedNotification;
  }
}