import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (
      !loading &&
      user &&
      !requiredRoles.includes(user.role as UserRole)
    ) {
      router.push("/");
    }
  }, [user, loading, requiredRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado para login
  }

  if (!requiredRoles.includes(user.role as UserRole)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
