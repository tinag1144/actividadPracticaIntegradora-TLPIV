import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { ProductListPage } from "./pages/ProductListPage";
import { RegisterPage } from "./pages/RegisterPage";

export function App() {
  const [notificationRevision, setNotificationRevision] = useState(0);

  return (
    <>
      <Navbar notificationRevision={notificationRevision} />
      <main className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/products" replace />} />
          </Route>

          <Route element={<ProtectedRoute permission="product:read" />}>
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route element={<ProtectedRoute permission="product:update" />}>
              <Route path="/products/:id/edit" element={<ProductFormPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute permission="product:create" />}>
            <Route path="/products/new" element={<ProductFormPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="notification:read" />}>
            <Route path="/notifications" element={
              <NotificationsPage onRead={() => setNotificationRevision((revision) => revision + 1)} />
            } />
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
