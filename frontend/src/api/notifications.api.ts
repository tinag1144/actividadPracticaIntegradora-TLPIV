import { apiFetch } from "./client";
import type { Notification } from "../types";

export const notificationsApi = {
  list: (): Promise<Notification[]> => apiFetch("/notifications"),
  unreadCount: (): Promise<{ count: number }> => apiFetch("/notifications/unread-count"),
  markAsRead: (id: string): Promise<Notification> =>
    apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }),
};
