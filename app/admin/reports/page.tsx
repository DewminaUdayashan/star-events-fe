"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function AdminReportsPage() {
  const [selectedDateRange, setSelectedDateRange] = useState("last-30-days");

  const reportTypes = [
    {
      id: "sales",
      title: "Sales Report",
      description:
        "Track sales performance, revenue trends, and ticket sales analytics",
      icon: TrendingUp,
      href: "/admin/reports/sales",
      stats: {
        thisMonth: "$45,230",
        growth: "+12.5%",
        isPositive: true,
      },
      color: "bg-blue-500",
    },
    {
      id: "users",
      title: "Users Report",
      description:
        "Analyze user registrations, demographics, and engagement metrics",
      icon: Users,
      href: "/admin/reports/users",
      stats: {
        thisMonth: "1,234",
        growth: "+8.3%",
        isPositive: true,
      },
      color: "bg-green-500",
    },
    {
      id: "events",
      title: "Events Report",
      description:
        "Review event performance, attendance rates, and organizer insights",
      icon: Calendar,
      href: "/admin/reports/events",
      stats: {
        thisMonth: "87",
        growth: "+5.2%",
        isPositive: true,
      },
      color: "bg-purple-500",
    },
    {
      id: "revenue",
      title: "Revenue Report",
      description:
        "Comprehensive financial overview, commissions, and payment analytics",
      icon: DollarSign,
      href: "/admin/reports/revenue",
      stats: {
        thisMonth: "$89,450",
        growth: "+15.7%",
        isPositive: true,
      },
      color: "bg-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Export All Reports (PDF)",
      description:
        "Download a comprehensive PDF containing all report summaries",
      icon: FileText,
      action: "export-all-pdf",
    },
    {
      title: "Export All Reports (Excel)",
      description: "Download detailed Excel files for all report categories",
      icon: Download,
      action: "export-all-excel",
    },
    {
      title: "Schedule Report",
      description: "Set up automated report delivery via email",
      icon: Calendar,
      action: "schedule-reports",
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Reports</h1>
          <p className="text-gray-400">
            Comprehensive analytics and insights for your event platform
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card key={report.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    {report.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${report.color}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">
                    {report.stats.thisMonth}
                  </div>
                  <div className="flex items-center text-xs">
                    <Badge
                      variant={
                        report.stats.isPositive ? "default" : "destructive"
                      }
                      className={`mr-1 ${
                        report.stats.isPositive
                          ? "bg-green-900 text-green-100 hover:bg-green-800"
                          : "bg-red-900 text-red-100"
                      }`}
                    >
                      {report.stats.growth}
                    </Badge>
                    <span className="text-gray-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card
                key={report.id}
                className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${report.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">
                        {report.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        asChild
                      >
                        <Link href={report.href}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Report
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Batch operations and report management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <div
                    key={index}
                    className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-white">
                        {action.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      {action.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Recent Report Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest report generations and exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: "Sales Report exported as PDF",
                  user: "Admin User",
                  time: "2 hours ago",
                  type: "export",
                },
                {
                  action: "Revenue Report generated",
                  user: "System",
                  time: "4 hours ago",
                  type: "generated",
                },
                {
                  action: "Users Report exported as Excel",
                  user: "Manager",
                  time: "1 day ago",
                  type: "export",
                },
                {
                  action: "Events Report viewed",
                  user: "Admin User",
                  time: "2 days ago",
                  type: "viewed",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-white">{activity.action}</p>
                      <p className="text-xs text-gray-400">
                        by {activity.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
