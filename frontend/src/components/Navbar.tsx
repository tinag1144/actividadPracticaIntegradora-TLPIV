import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { Can } from "./Can";
import { NotificationBell } from "./NotificationBell";

export function Navbar({ notificationRevision }: { notificationRevision: number }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Tech Store
      </Link>

      {user ? (
        <>
          <nav className="nav-links">
            <Can permission="product:read">
              <NavLink to="/products">Productos</NavLink>
            </Can>
            <Can permission="notification:read">
              <NotificationBell key={user.id} revision={notificationRevision} />
            </Can>
            <Can permission="user:read">
              <NavLink to="/admin/users">Usuarios</NavLink>
            </Can>
          </nav>
          <div className="nav-user">
            <span>
              {user.email} <small>({user.role})</small>
            </span>
            <button type="button" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </>
      ) : (
        <nav className="nav-links">
          <NavLink to="/login">Ingresar</NavLink>
          <NavLink to="/register">Registrarse</NavLink>
        </nav>
      )}
    </header>
  );
}
