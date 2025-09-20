"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  ArrowLeft,
  Loader2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  organizerReportsService,
  type OrganizerReportFilters,
} from "@/lib/services/organizer-reports.service";
import { ExportModal } from "@/components/organizer/ExportModal";

export default function OrganizerRevenueReportPage() {
  const { user, roles } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const {
    data: revenueData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizer-revenue-report", selectedYear],
    queryFn: () => organizerReportsService.getMonthlyRevenue(selectedYear),
    enabled: !!user && roles.includes("Organizer"),
  });

  if (!user || !roles.includes("Organizer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as an organizer to access revenue reports.
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const report = revenueData?.data;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/reports">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Revenue Analytics
                </h1>
                <p className="text-gray-400">
                  Monthly revenue breakdown and financial insights
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ExportModal
                reportType="revenue"
                trigger={
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                }
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-white">Loading revenue report...</span>
            </div>
          )}

          {error && (
            <Card className="bg-red-500/10 border-red-500/20 mb-8">
              <CardContent className="p-6">
                <p className="text-red-400">
                  Failed to load revenue report. Please try again.
                </p>
              </CardContent>
            </Card>
          )}

          {report && (
            <>
              {/* Summary Card */}
              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400">
                          Total Revenue {selectedYear}
                        </p>
                        <p className="text-3xl font-bold text-white">
                          LKR {report.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400">Average Monthly Revenue</p>
                        <p className="text-3xl font-bold text-white">
                          LKR{" "}
                          {(report.totalRevenue / 12).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 0 }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Revenue Chart */}
              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">
                    Monthly Revenue Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Revenue performance throughout {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthNames.map((month, index) => {
                      const revenue = report.revenueByMonth[month] || 0;
                      const maxRevenue = Math.max(
                        ...Object.values(report.revenueByMonth)
                      );
                      const percentage =
                        maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                      return (
                        <div
                          key={month}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-12 text-right">
                            <span className="text-white font-medium text-sm">
                              {month}
                            </span>
                          </div>
                          <div className="flex-1 relative">
                            <div className="w-full bg-gray-700 rounded-full h-8 relative overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                style={{ width: `${percentage}%` }}
                              >
                                {revenue > 0 && (
                                  <span className="text-white text-xs font-medium">
                                    LKR {revenue.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {revenue === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    No revenue
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-24 text-right">
                            <span className="text-gray-300 text-sm">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-medium mb-2">
                        Best Month
                      </h3>
                      <p className="text-2xl font-bold text-green-400">
                        {
                          Object.entries(report.revenueByMonth).reduce((a, b) =>
                            (report.revenueByMonth[a[0]] || 0) >
                            (report.revenueByMonth[b[0]] || 0)
                              ? a
                              : b
                          )[0]
                        }
                      </p>
                      <p className="text-gray-400 text-sm">
                        LKR{" "}
                        {Math.max(
                          ...Object.values(report.revenueByMonth)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-medium mb-2">
                        Active Months
                      </h3>
                      <p className="text-2xl font-bold text-blue-400">
                        {
                          Object.values(report.revenueByMonth).filter(
                            (revenue) => revenue > 0
                          ).length
                        }
                      </p>
                      <p className="text-gray-400 text-sm">
                        out of {monthNames.length} months
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-medium mb-2">
                        Growth Trend
                      </h3>
                      <p className="text-2xl font-bold text-orange-400">
                        {(() => {
                          const values = Object.values(
                            report.revenueByMonth
                          ).filter((v) => v > 0);
                          const firstHalf = values.slice(
                            0,
                            Math.floor(values.length / 2)
                          );
                          const secondHalf = values.slice(
                            Math.floor(values.length / 2)
                          );
                          const firstAvg =
                            firstHalf.length > 0
                              ? firstHalf.reduce((a, b) => a + b, 0) /
                                firstHalf.length
                              : 0;
                          const secondAvg =
                            secondHalf.length > 0
                              ? secondHalf.reduce((a, b) => a + b, 0) /
                                secondHalf.length
                              : 0;
                          const growth =
                            firstAvg > 0
                              ? ((secondAvg - firstAvg) / firstAvg) * 100
                              : 0;
                          return growth > 0
                            ? `+${growth.toFixed(1)}%`
                            : `${growth.toFixed(1)}%`;
                        })()}
                      </p>
                      <p className="text-gray-400 text-sm">vs first half</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
