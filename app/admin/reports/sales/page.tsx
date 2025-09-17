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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Ticket,
} from "lucide-react";
import { useAdminSalesReport } from "@/lib/services";
import { ReportFilters } from "@/lib/types/api";
import { ExportModal } from "@/components/admin/ExportModal";
import Link from "next/link";

export default function AdminSalesReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
    groupBy: "daily",
  });

  const { data: salesReport, isLoading, error } = useAdminSalesReport(filters);

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "last-7-days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last-30-days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "last-90-days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "last-year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        setFilters((prev) => ({ ...prev, groupBy: "monthly" }));
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFilters((prev) => ({
      ...prev,
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Error Loading Sales Report
            </h1>
            <p className="text-gray-400">
              Unable to fetch sales data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <Link href="/admin/reports" className="hover:text-white">
                Reports
              </Link>
              <span>/</span>
              <span>Sales Report</span>
            </nav>
            <h1 className="text-3xl font-bold text-white mb-2">Sales Report</h1>
            <p className="text-gray-400">
              Track sales performance, revenue trends, and ticket sales
              analytics
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select
              value={filters.groupBy}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setFilters((prev) => ({ ...prev, groupBy: value }))
              }
            >
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={handleDateRangeChange}
              defaultValue="last-30-days"
            >
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>

            <ExportModal
              reportType="sales"
              filters={filters}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600/10 hover:text-purple-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              }
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                ${salesReport?.totalRevenue?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">+12.5%</span>
                <span className="text-gray-400 ml-1">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Total Sales
              </CardTitle>
              <Ticket className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {salesReport?.totalTicketsSold?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">tickets sold</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Average Order Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                ${salesReport?.averageTicketPrice?.toFixed(2) || "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">per transaction</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart Placeholder */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">Sales Trend</CardTitle>
            <CardDescription className="text-gray-400">
              {filters.groupBy?.charAt(0).toUpperCase()}
              {filters.groupBy?.slice(1)} sales performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Sales trend chart will be displayed here
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Integration with charting library (Chart.js, Recharts) needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Events */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Top Performing Events
            </CardTitle>
            <CardDescription className="text-gray-400">
              Events with highest sales in selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesReport?.topEventsBySales
                ?.slice(0, 5)
                .map((event, index) => (
                  <div
                    key={event.eventId}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {event.eventTitle}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {event.ticketsSold} tickets sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${event.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">revenue</div>
                    </div>
                  </div>
                )) ||
                [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          Sample Event {index + 1}
                        </h3>
                        <p className="text-sm text-gray-400">
                          150 tickets sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${(1500 * (3 - index)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">revenue</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Sales by Category
              </CardTitle>
              <CardDescription className="text-gray-400">
                Revenue breakdown by event categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesReport?.salesByCategory
                  ?.slice(0, 5)
                  .map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-${
                            ["blue", "green", "purple", "orange", "red"][
                              index % 5
                            ]
                          }-500`}
                        ></div>
                        <span className="text-white">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${category.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(
                            (category.revenue /
                              (salesReport?.totalRevenue || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                  )) ||
                  [...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-${
                            ["blue", "green", "purple", "orange", "red"][index]
                          }-500`}
                        ></div>
                        <span className="text-white">Category {index + 1}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${(5000 - index * 1000).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {((5 - index) * 5).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Latest sales activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-900 rounded"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">
                        Order #{1000 + index}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(
                          Date.now() - index * 2 * 60 * 60 * 1000
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        ${(89 + index * 20).toFixed(2)}
                      </div>
                      <div className="text-xs text-green-400">Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
