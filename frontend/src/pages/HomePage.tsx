import { useAuth } from "../context/useAuth";

// Placeholder until the product list page (ProductListPage) is added.
export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="card">
      <h1>Productos</h1>
      <p>
        Sesión iniciada como <strong>{user?.email}</strong> con rol <strong>{user?.role}</strong>.
      </p>
      <p>El listado de productos se agrega en esta pantalla.</p>
    </section>
  );
}
