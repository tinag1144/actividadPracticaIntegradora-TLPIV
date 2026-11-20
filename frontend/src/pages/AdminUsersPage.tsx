import { useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { usersApi } from "../api/users.api";
import { Can } from "../components/Can";
import { useAuth } from "../context/useAuth";
import { ROLE_NAMES, type AuthUser, type RoleName } from "../types";

const isRoleName = (value: string): value is RoleName => (ROLE_NAMES as readonly string[]).includes(value);

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    usersApi
      .list()
      .then((list) => {
        if (!cancelled) setUsers(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRoleChange = async (userId: string, value: string): Promise<void> => {
    if (!isRoleName(value)) return;
    setError(null);
    setSavingId(userId);
    try {
      const updated = await usersApi.assignRole(userId, value);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo asignar el rol");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <p className="status">Cargando usuarios...</p>;
  }

  return (
    <section className="card">
      <h1>Usuarios</h1>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => {
            const isSelf = item.id === currentUser?.id;
            return (
              <tr key={item.id}>
                <td>
                  {item.email} {isSelf && <small>(tu usuario)</small>}
                </td>
                <td>
                  <Can permission="user:assign-role" fallback={<span>{item.role}</span>}>
                    <select
                      aria-label={`Rol de ${item.email}`}
                      value={item.role}
                      disabled={isSelf || savingId === item.id}
                      onChange={(event) => void handleRoleChange(item.id, event.target.value)}
                    >
                      {ROLE_NAMES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </Can>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
