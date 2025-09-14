"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "organizer" | "customer"
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/auth/login" 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      // Check role if required
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect based on user role
        switch (user?.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "organizer":
            router.push("/organizer/dashboard")
            break
          case "customer":
            router.push("/")
            break
          default:
            router.push("/")
        }
        return
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, fallbackPath, router])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
