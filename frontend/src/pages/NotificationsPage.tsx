import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ApiError } from "../api/client";
import { notificationsApi } from "../api/notifications.api";
import { Can } from "../components/Can";
import type { Notification } from "../types";

export function NotificationsPage({ onRead }: { onRead: () => void }) {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    notificationsApi.list().then((items) => {
      if (!cancelled) {
        setNotifications([...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      }
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudieron cargar las notificaciones.");
    });
    return () => { cancelled = true; };
  }, []);

  const markAsRead = async (id: string) => {
    setSavingId(id);
    setError(null);
    try {
      const updated = await notificationsApi.markAsRead(id);
      setNotifications((items) => items?.map((item) => item.id === id ? updated : item) ?? null);
      onRead();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo marcar como leída.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="card">
      <h1>Notificaciones</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {!notifications && !error && <p className="status" role="status">Cargando notificaciones…</p>}
      {notifications?.length === 0 && <p>Todavía no tenés notificaciones.</p>}
      {notifications && notifications.length > 0 && (
        <ul className="notifications">
          {notifications.map((item) => (
            <li key={item.id}>
              <div>
                <Can permission="product:read" fallback={<strong>{item.productName}</strong>}>
                  <Link to={`/products/${encodeURIComponent(item.productId)}`}>{item.productName}</Link>
                </Can>
                <p>{item.message}</p>
                <small><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("es-AR")}</time> · {item.read ? "Leída" : "Sin leer"}</small>
              </div>
              {!item.read && (
                <button type="button" disabled={savingId !== null} onClick={() => void markAsRead(item.id)}>
                  {savingId === item.id ? "Guardando…" : "Marcar como leída"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
