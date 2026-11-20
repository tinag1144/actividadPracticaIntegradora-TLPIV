import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ApiError } from "../api/client";
import { productsApi } from "../api/products.api";
import { Can } from "../components/Can";
import { PRODUCT_STATUS_LABELS, type Product } from "../types";

export function ProductListPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    productsApi.list().then((list) => {
      if (!cancelled) setProducts(list);
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudieron cargar los productos.");
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="card">
      <div className="section-heading">
        <h1>Productos</h1>
        <Can permission="product:create">
          <Link className="button-link" to="/products/new">Nuevo producto</Link>
        </Can>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {!products && !error && <p className="status" role="status">Cargando productos…</p>}
      {products?.length === 0 && <p>Todavía no hay productos.</p>}
      {products && products.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><Link to={`/products/${encodeURIComponent(product.id)}`}>{product.name}</Link></td>
                  <td>{product.category}</td>
                  <td>{product.price.toLocaleString("es-AR")}</td>
                  <td>{product.stock.toLocaleString("es-AR")}</td>
                  <td>{PRODUCT_STATUS_LABELS[product.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
