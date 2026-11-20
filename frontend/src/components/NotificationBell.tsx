import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { notificationsApi } from "../api/notifications.api";

export function NotificationBell({ revision }: { revision: number }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const result = await notificationsApi.unreadCount();
        if (!cancelled) setCount(result.count);
      } catch {
        if (!cancelled) setCount(null);
      } finally {
        if (!cancelled) timer = window.setTimeout(() => void refresh(), 15_000);
      }
    };
    void refresh();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [revision]);

  return (
    <NavLink
      to="/notifications"
      aria-label={count === null ? "Notificaciones" : `Notificaciones, ${count} sin leer`}
    >
      Notificaciones {count !== null && <span className="unread-count" aria-hidden="true">{count}</span>}
    </NavLink>
  );
}
