import { AdminLayout } from "@/components/admin/AdminSidebar";
import { Navigation } from "@/components/layout/Navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="Admin">
      {/* <Navigation /> */}
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
