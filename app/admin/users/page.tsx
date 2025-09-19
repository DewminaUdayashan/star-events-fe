import AdminUserManagement from "@/components/admin/AdminUserManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users | StarEvents",
  description: "Manage administrator accounts and permissions",
};

export default function AdminUsersPage() {
  return <AdminUserManagement />;
}
