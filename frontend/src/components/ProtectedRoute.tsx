import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/useAuth";
import type { Permission } from "../types";

interface ProtectedRouteProps {
  // When set, the user also needs this permission. The backend still enforces it with 403.
  permission?: Permission;
}

export function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="status">Cargando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <section className="card">
        <h2>Acceso denegado</h2>
        <p>Tu rol no tiene el permiso <code>{permission}</code>.</p>
      </section>
    );
  }

  return <Outlet />;
}
