import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/useAuth";
import type { Credentials } from "../types";

const getRedirectPath = (state: unknown): string => {
  if (typeof state === "object" && state !== null && "from" in state && typeof state.from === "string") {
    return state.from;
  }
  return "/";
};

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirectPath(location.state);

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (credentials: Credentials): Promise<void> => {
    await login(credentials);
    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthForm
      title="Ingresar"
      submitLabel="Ingresar"
      onSubmit={handleLogin}
      footer={
        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      }
    />
  );
}
