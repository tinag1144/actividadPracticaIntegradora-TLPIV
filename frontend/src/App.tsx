import { Navigate, Route, Routes } from "react-router";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route element={<ProtectedRoute permission="user:read" />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
