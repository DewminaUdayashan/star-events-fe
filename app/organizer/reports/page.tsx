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
  BarChart3,
  CreditCard,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ExportModal } from "@/components/organizer/ExportModal";

export default function OrganizerReportsPage() {
  const { user, roles } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState("last-30-days");

  if (!user || !roles.includes("Organizer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as an organizer to access reports.
          </p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const reportTypes = [
    {
      id: "sales",
      title: "Sales Report",
      description:
        "Track your sales performance, revenue trends, and ticket sales analytics",
      icon: TrendingUp,
      href: "/organizer/reports/sales",
      stats: {
        thisMonth: "$15,230",
        growth: "+8.5%",
        isPositive: true,
      },
      color: "bg-blue-500",
    },
    {
      id: "events",
      title: "Events Performance",
      description:
        "Analyze event performance, attendance rates, and capacity utilization",
      icon: Calendar,
      href: "/organizer/reports/events",
      stats: {
        thisMonth: "12",
        growth: "+3",
        isPositive: true,
      },
      color: "bg-purple-500",
    },
    {
      id: "revenue",
      title: "Revenue Analytics",
      description:
        "Monthly revenue breakdown and financial performance insights",
      icon: DollarSign,
      href: "/organizer/reports/revenue",
      stats: {
        thisMonth: "$24,450",
        growth: "+12.7%",
        isPositive: true,
      },
      color: "bg-green-500",
    },
    {
      id: "payments",
      title: "Payment Methods",
      description: "Payment methods analysis and transaction breakdowns",
      icon: CreditCard,
      href: "/organizer/reports/payments",
      stats: {
        thisMonth: "127",
        growth: "+5.2%",
        isPositive: true,
      },
      color: "bg-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Export All Reports (PDF)",
      description:
        "Download a comprehensive PDF containing all your report summaries",
      icon: FileText,
      action: "export-all-pdf",
    },
    {
      title: "Export All Reports (Excel)",
      description: "Download detailed Excel files for all report categories",
      icon: Download,
      action: "export-all-excel",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-400">
                Monitor your event performance and revenue insights
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/organizer/dashboard">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <Card
                  key={report.id}
                  className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gray-700 text-gray-300"
                      >
                        {report.stats.growth}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <CardTitle className="text-white text-lg">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          {report.description}
                        </CardDescription>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {report.stats.thisMonth}
                          </p>
                          <p className="text-sm text-gray-400">This month</p>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={report.href}>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Quick Export Actions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Export comprehensive reports for offline analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.action}
                      className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {action.title}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {action.description}
                        </p>
                      </div>
                      <ExportModal
                        reportType={
                          action.action === "export-all"
                            ? "sales"
                            : (action.action.replace("export-", "") as any)
                        }
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:text-white"
                          >
                            Export
                          </Button>
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Report Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Total Revenue</h3>
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">$39,680</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">
                    +15.3% vs last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Total Events</h3>
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">28</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-purple-400 text-sm">+3 new events</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Tickets Sold</h3>
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">1,247</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm">
                    +8.7% conversion
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
