import { Link, Navigate, useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/useAuth";
import type { Credentials } from "../types";

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (credentials: Credentials): Promise<void> => {
    await register(credentials);
    navigate("/", { replace: true });
  };

  return (
    <AuthForm
      title="Crear cuenta"
      submitLabel="Registrarse"
      onSubmit={handleRegister}
      footer={
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      }
    />
  );
}
