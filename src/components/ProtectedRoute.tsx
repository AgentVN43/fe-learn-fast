import { type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/login", replace: true });
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    navigate({ to: "/", replace: true });
    return null;
  }

  return <>{children}</>;
};
