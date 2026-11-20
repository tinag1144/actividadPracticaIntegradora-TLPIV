import { useState, type FormEvent, type ReactNode } from "react";
import { ApiError } from "../api/client";
import type { Credentials } from "../types";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (credentials: Credentials) => Promise<void>;
  footer?: ReactNode;
}

// Presentational email/password form shared by LoginPage and RegisterPage.
export function AuthForm({ title, submitLabel, onSubmit, footer }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card auth-card">
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            autoComplete={submitLabel === "Ingresar" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : submitLabel}
        </button>
      </form>
      {footer}
    </section>
  );
}
