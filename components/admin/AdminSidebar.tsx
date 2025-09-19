"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Users,
  MapPin,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  PieChart,
  UserCheck,
} from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    title: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Organizers",
    href: "/admin/organizers",
    icon: Users,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UserCheck,
  },
  {
    title: "Venues",
    href: "/admin/venues",
    icon: MapPin,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
    subItems: [
      {
        title: "Sales Report",
        href: "/admin/reports/sales",
        icon: TrendingUp,
      },
      {
        title: "Users Report",
        href: "/admin/reports/users",
        icon: Users,
      },
      {
        title: "Events Report",
        href: "/admin/reports/events",
        icon: Calendar,
      },
      {
        title: "Revenue Report",
        href: "/admin/reports/revenue",
        icon: DollarSign,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isReportsSection = pathname.startsWith("/admin/reports");

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const showSubItems = hasSubItems && (isActive || isReportsSection);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>

                {/* Sub-items for Reports */}
                {showSubItems && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                            isSubActive
                              ? "bg-purple-500 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          )}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
