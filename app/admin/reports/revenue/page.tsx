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
  DollarSign,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Wallet,
  Building,
  Receipt,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdminRevenueReport } from "@/lib/services";
import { ReportFilters } from "@/lib/types/api";
import { ExportModal } from "@/components/admin/ExportModal";
import Link from "next/link";

export default function AdminRevenueReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
    groupBy: "daily",
  });

  const {
    data: revenueReport,
    isLoading,
    error,
  } = useAdminRevenueReport(filters);

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
              Error Loading Revenue Report
            </h1>
            <p className="text-gray-400">
              Unable to fetch revenue data. Please try again later.
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
              <span>Revenue Report</span>
            </nav>
            <h1 className="text-3xl font-bold text-white mb-2">
              Revenue Report
            </h1>
            <p className="text-gray-400">
              Comprehensive financial overview, commissions, and payment
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
              reportType="revenue"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                ${revenueReport?.totalRevenue?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">
                  +{revenueReport?.projection?.growthRate?.toFixed(1) || "0"}%
                </span>
                <span className="text-gray-400 ml-1">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Platform Commissions
              </CardTitle>
              <Percent className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                ${((revenueReport?.totalRevenue || 0) * 0.1).toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">10.0% commission rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Organizer Earnings
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                ${((revenueReport?.totalRevenue || 0) * 0.9).toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">90.0% of total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Avg Transaction Value
              </CardTitle>
              <Receipt className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                $
                {revenueReport?.totalRevenue &&
                revenueReport.revenueByPeriod.length > 0
                  ? (
                      revenueReport.totalRevenue /
                      revenueReport.revenueByPeriod.reduce(
                        (acc, period) => acc + period.transactionCount,
                        0
                      )
                    ).toFixed(2)
                  : "0"}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-400">per transaction</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Revenue Breakdown
              </CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of revenue sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white">Completed Revenue</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      $
                      {revenueReport?.completedRevenue?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {revenueReport?.totalRevenue
                        ? (
                            (revenueReport.completedRevenue /
                              revenueReport.totalRevenue) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Percent className="h-4 w-4 text-blue-400" />
                    <span className="text-white">Pending Revenue</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${revenueReport?.pendingRevenue?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {revenueReport?.totalRevenue
                        ? (
                            (revenueReport.pendingRevenue /
                              revenueReport.totalRevenue) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-purple-400" />
                    <span className="text-white">Refunded Amount</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${revenueReport?.refundedAmount?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {revenueReport?.totalRevenue
                        ? (
                            (revenueReport.refundedAmount /
                              revenueReport.totalRevenue) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-orange-400" />
                    <span className="text-white">Net Revenue</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${revenueReport?.netRevenue?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {revenueReport?.totalRevenue
                        ? (
                            (revenueReport.netRevenue /
                              revenueReport.totalRevenue) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Payment Methods
              </CardTitle>
              <CardDescription className="text-gray-400">
                Revenue by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            method: "Credit Card",
                            revenue: 45670,
                            percentage: 65.2,
                            color: "#3B82F6",
                          },
                          {
                            method: "PayPal",
                            revenue: 15430,
                            percentage: 22.0,
                            color: "#10B981",
                          },
                          {
                            method: "Bank Transfer",
                            revenue: 6780,
                            percentage: 9.7,
                            color: "#8B5CF6",
                          },
                          {
                            method: "Digital Wallet",
                            revenue: 2120,
                            percentage: 3.1,
                            color: "#F59E0B",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="percentage"
                      >
                        {[
                          { color: "#3B82F6" },
                          { color: "#10B981" },
                          { color: "#8B5CF6" },
                          { color: "#F59E0B" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F9FAFB",
                        }}
                        formatter={(value: any, name: string, props: any) => [
                          `${value.toFixed(1)}%`,
                          props.payload.method,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend/Details */}
                <div className="space-y-4">
                  {[
                    {
                      method: "Credit Card",
                      revenue: 45670,
                      percentage: 65.2,
                      color: "bg-blue-500",
                    },
                    {
                      method: "PayPal",
                      revenue: 15430,
                      percentage: 22.0,
                      color: "bg-green-500",
                    },
                    {
                      method: "Bank Transfer",
                      revenue: 6780,
                      percentage: 9.7,
                      color: "bg-purple-500",
                    },
                    {
                      method: "Digital Wallet",
                      revenue: 2120,
                      percentage: 3.1,
                      color: "bg-orange-500",
                    },
                  ].map((method) => (
                    <div
                      key={method.method}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${method.color}`}
                        ></div>
                        <span className="text-white">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${method.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {method.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart Placeholder */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">Revenue Trend</CardTitle>
            <CardDescription className="text-gray-400">
              {filters.groupBy?.charAt(0).toUpperCase()}
              {filters.groupBy?.slice(1)} revenue performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    revenueReport?.revenueByPeriod?.map((period) => ({
                      period: period.period,
                      revenue: period.revenue,
                      pending: period.pendingRevenue,
                      completed: period.completedRevenue,
                      growth: period.growthRate,
                    })) || [
                      {
                        period: "Week 1",
                        revenue: 15000,
                        pending: 2000,
                        completed: 13000,
                        growth: 5.2,
                      },
                      {
                        period: "Week 2",
                        revenue: 22000,
                        pending: 3200,
                        completed: 18800,
                        growth: 8.1,
                      },
                      {
                        period: "Week 3",
                        revenue: 18500,
                        pending: 2800,
                        completed: 15700,
                        growth: 3.4,
                      },
                      {
                        period: "Week 4",
                        revenue: 29000,
                        pending: 4100,
                        completed: 24900,
                        growth: 12.8,
                      },
                    ]
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value: any, name: string) => [
                      `$${value?.toLocaleString()}`,
                      name === "revenue"
                        ? "Total Revenue"
                        : name === "completed"
                        ? "Completed Revenue"
                        : name === "pending"
                        ? "Pending Revenue"
                        : name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#10B981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Earning Events and Organizers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Top Earning Events
              </CardTitle>
              <CardDescription className="text-gray-400">
                Events generating the most revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueReport?.topRevenueEvents
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
                  [...Array(5)].map((_, index) => (
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
                            High Revenue Event {index + 1}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {500 - index * 75} tickets sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${((75 - index * 12) * 1000).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">revenue</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Top Earning Organizers
              </CardTitle>
              <CardDescription className="text-gray-400">
                Organizers with highest revenue generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueReport?.revenueByOrganizer
                  ?.slice(0, 5)
                  .map((organizer, index) => (
                    <div
                      key={organizer.organizerId}
                      className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {organizer.organizerName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {organizer.eventCount} events
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${organizer.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">earned</div>
                      </div>
                    </div>
                  )) ||
                  [...Array(5)].map((_, index) => (
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
                            Top Organizer {index + 1}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {25 - index * 3} events
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${((120 - index * 20) * 1000).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">earned</div>
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
