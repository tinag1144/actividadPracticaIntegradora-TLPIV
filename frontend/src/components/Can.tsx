import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";
import type { Permission } from "../types";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

// Renders children only when the logged user has the permission.
// This only hides UI: the real protection is the backend answering 403.
export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useAuth();
  return <>{hasPermission(permission) ? children : fallback}</>;
}
