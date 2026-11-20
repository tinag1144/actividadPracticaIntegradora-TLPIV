import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../api/client";
import { productsApi } from "../api/products.api";
import { ProductStatusSelect } from "../components/ProductStatusSelect";
import type { Product, ProductFields, ProductStatus } from "../types";

export function ProductFormPage() {
  const { id } = useParams();
  return <ProductForm key={id ?? "new"} id={id} />;
}

function ProductForm({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<ProductStatus>("DISPONIBLE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backTo = id ? `/products/${encodeURIComponent(id)}` : "/products";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    productsApi.detail(id).then((item) => {
      if (!cancelled) setProduct(item);
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudo cargar el producto.");
    });
    return () => { cancelled = true; };
  }, [id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: ProductFields = {
      name: String(data.get("name") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      category: String(data.get("category") ?? "").trim(),
      price: Number(data.get("price")),
      stock: Number(data.get("stock")),
    };
    if (!fields.name || !fields.description || !fields.category) {
      setError("Completá el nombre, la descripción y la categoría.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = id ? await productsApi.update(id, fields) : await productsApi.create({ ...fields, status });
      navigate(`/products/${encodeURIComponent(saved.id)}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <h1>{id ? "Editar producto" : "Nuevo producto"}</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {id && !product && !error && <p className="status" role="status">Cargando producto…</p>}
      {(!id || product) && (
        <form className="product-form" onSubmit={(event) => void submit(event)}>
          <label>Nombre <input name="name" required defaultValue={product?.name} disabled={saving} /></label>
          <label>Descripción <textarea name="description" rows={4} required defaultValue={product?.description} disabled={saving} /></label>
          <label>Categoría <input name="category" required defaultValue={product?.category} disabled={saving} /></label>
          <label>Precio <input name="price" required type="number" min="0" step="any" defaultValue={product?.price} disabled={saving} /></label>
          <label>Stock <input name="stock" required type="number" min="0" step="1" defaultValue={product?.stock} disabled={saving} /></label>
          {!id && <ProductStatusSelect value={status} onChange={setStatus} disabled={saving} />}
          <div className="actions">
            <button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</button>
            <Link to={backTo}>Cancelar</Link>
          </div>
        </form>
      )}
      {id && !product && error && <Link to="/products">Volver a Productos</Link>}
    </section>
  );
}
