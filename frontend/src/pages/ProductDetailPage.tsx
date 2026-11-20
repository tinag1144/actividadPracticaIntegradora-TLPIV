import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../api/client";
import { productsApi } from "../api/products.api";
import { Can } from "../components/Can";
import { ProductStatusSelect } from "../components/ProductStatusSelect";
import { useAuth } from "../context/useAuth";
import { PRODUCT_STATUS_LABELS, type Product, type ProductStatus } from "../types";

export function ProductDetailPage() {
  const { id } = useParams();
  return id ? <ProductDetail key={id} id={id} /> : <p role="alert">Falta el identificador del producto.</p>;
}

function ProductDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canSubscribe = hasPermission("subscription:create");
  const canUnsubscribe = hasPermission("subscription:delete");
  const showSubscription = canSubscribe || canUnsubscribe;
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<ProductStatus>("DISPONIBLE");
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    productsApi.detail(id).then((item) => {
      if (cancelled) return;
      setProduct(item);
      setStatus(item.status);
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudo cargar el producto.");
    });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!showSubscription) return;
    let cancelled = false;
    productsApi.subscription(id).then((result) => {
      if (!cancelled) setSubscribed(result.subscribed);
    }).catch((err: unknown) => {
      if (!cancelled) {
        setSubscriptionError(err instanceof ApiError ? err.message : "No se pudo consultar la suscripción.");
      }
    });
    return () => { cancelled = true; };
  }, [id, showSubscription]);

  const runAction = async (action: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  };

  const toggleSubscription = () => runAction(async () => {
    if (subscribed) {
      try {
        await productsApi.unsubscribe(id);
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 404) throw err;
      }
      setSubscribed(false);
      return;
    }
    try {
      const result = await productsApi.subscribe(id);
      setSubscribed(result.subscribed);
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 409) throw err;
      setSubscribed(true);
    }
  });

  return (
    <section className="card">
      <Link to="/products">Volver a Productos</Link>
      {error && <p className="error" role="alert">{error}</p>}
      {!product && !error && <p className="status" role="status">Cargando producto…</p>}
      {product && (
        <>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <dl className="product-facts">
            <div><dt>Categoría</dt><dd>{product.category}</dd></div>
            <div><dt>Precio</dt><dd>{product.price.toLocaleString("es-AR")}</dd></div>
            <div><dt>Stock</dt><dd>{product.stock.toLocaleString("es-AR")}</dd></div>
            <div><dt>Estado</dt><dd>{PRODUCT_STATUS_LABELS[product.status]}</dd></div>
          </dl>
          <div className="actions">
            <Can permission="product:update">
              <Link to={`/products/${encodeURIComponent(id)}/edit`}>Editar producto</Link>
            </Can>
            <Can permission="product:delete">
              <button type="button" className="danger" disabled={busy} onClick={() => {
                if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
                void runAction(async () => {
                  await productsApi.delete(id);
                  navigate("/products", { replace: true });
                });
              }}>Eliminar producto</button>
            </Can>
            {((subscribed === true && canUnsubscribe) || (subscribed === false && canSubscribe)) && (
              <button type="button" disabled={busy} onClick={() => void toggleSubscription()}>
                {subscribed ? "Desuscribirme" : "Suscribirme"}
              </button>
            )}
          </div>
          {showSubscription && subscribed === null && (
            subscriptionError
              ? <p className="error" role="alert">{subscriptionError}</p>
              : <p className="status" role="status">Consultando suscripción…</p>
          )}
          <Can permission="product:change-status">
            <form className="status-form" onSubmit={(event) => {
              event.preventDefault();
              void runAction(async () => {
                const updated = await productsApi.changeStatus(id, status);
                setProduct(updated);
                setStatus(updated.status);
              });
            }}>
              <ProductStatusSelect value={status} onChange={setStatus} disabled={busy} />
              <button type="submit" disabled={busy || status === product.status}>Cambiar estado</button>
            </form>
          </Can>
        </>
      )}
    </section>
  );
}
