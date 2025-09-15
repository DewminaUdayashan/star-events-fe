"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[]; // Single role or array of roles
  fallbackPath?: string;
}

/**
 * ProtectedRoute component that guards routes based on authentication and role requirements
 *
 * Usage examples:
 * - Single role: <ProtectedRoute requiredRole="Admin">...</ProtectedRoute>
 * - Multiple roles: <ProtectedRoute requiredRole={["Admin", "Organizer"]}>...</ProtectedRoute>
 * - No role requirement: <ProtectedRoute>...</ProtectedRoute> (just authentication)
 */

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, roles } = useAuth();
  const router = useRouter();

  // Helper function to check if user has required role(s)
  const hasRequiredRole = (
    userRoles: UserRole[],
    required?: UserRole | UserRole[]
  ): boolean => {
    if (!required) return true; // No role requirement

    if (Array.isArray(required)) {
      // Check if user has any of the required roles
      return required.some((role) => userRoles.includes(role));
    } else {
      // Check if user has the single required role
      return userRoles.includes(required);
    }
  };

  console.log("ProtectedRoute - User:", !!user);
  console.log("ProtectedRoute - isLoading:", isLoading);
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute - roles:", roles);
  console.log("ProtectedRoute - requiredRole:", requiredRole);
  console.log(
    "ProtectedRoute - hasRequiredRole check:",
    hasRequiredRole(roles, requiredRole)
  );

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      // Check role if required
      if (
        requiredRole &&
        roles.length > 0 &&
        !hasRequiredRole(roles, requiredRole)
      ) {
        // Redirect based on user role
        switch (roles[0]) {
          case "Admin":
            router.push("/admin/dashboard");
            break;
          case "Organizer":
            router.push("/organizer/dashboard");
            break;
          case "Customer":
            router.push("/");
            break;
          default:
            router.push("/");
        }
        return;
      }
    }
  }, [
    user,
    isLoading,
    isAuthenticated,
    requiredRole,
    fallbackPath,
    router,
    roles,
  ]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (
    !isAuthenticated ||
    (requiredRole && roles.length > 0 && !hasRequiredRole(roles, requiredRole))
  ) {
    return null;
  }

  return <>{children}</>;
}
