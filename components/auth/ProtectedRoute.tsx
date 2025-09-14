"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, roles } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      // Check role if required
      if (requiredRole && roles.length > 0 && !roles.includes(requiredRole)) {
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
  }, [user, isLoading, isAuthenticated, requiredRole, fallbackPath, router]);

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
    (requiredRole && roles.length > 0 && !roles.includes(requiredRole))
  ) {
    return null;
  }

  return <>{children}</>;
}
