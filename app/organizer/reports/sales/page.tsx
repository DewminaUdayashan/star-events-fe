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
import { Badge } from "@/components/ui/badge";
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
  Users,
  ShoppingCart,
  Download,
  Calendar,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  organizerReportsService,
  type OrganizerReportFilters,
} from "@/lib/services/organizer-reports.service";
import { ExportModal } from "@/components/organizer/ExportModal";

export default function OrganizerSalesReportPage() {
  const { user, roles } = useAuth();
  const [filters, setFilters] = useState<OrganizerReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizer-sales-report", filters],
    queryFn: () => organizerReportsService.getSalesReport(filters),
    enabled: !!user && roles.includes("Organizer"),
  });

  if (!user || !roles.includes("Organizer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as an organizer to access sales reports.
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

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "last-7-days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "last-30-days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "last-90-days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    setFilters({
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    });
  };

  const report = salesData?.data?.report;

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
                  Sales Report
                </h1>
                <p className="text-gray-400">
                  Track your sales performance and revenue trends
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Select
                defaultValue="last-30-days"
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                  <SelectItem value="this-year">This year</SelectItem>
                </SelectContent>
              </Select>
              <ExportModal
                reportType="sales"
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
              <span className="ml-2 text-white">Loading sales report...</span>
            </div>
          )}

          {error && (
            <Card className="bg-red-500/10 border-red-500/20 mb-8">
              <CardContent className="p-6">
                <p className="text-red-400">
                  Failed to load sales report. Please try again.
                </p>
              </CardContent>
            </Card>
          )}

          {report && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">
                          LKR {report.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Tickets Sold</p>
                        <p className="text-2xl font-bold text-white">
                          {report.totalTicketsSold.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">
                          Total Transactions
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {report.totalTransactions.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">
                          Avg. Ticket Price
                        </p>
                        <p className="text-2xl font-bold text-white">
                          LKR {report.averageTicketPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales by Category */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Sales by Category
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Revenue breakdown by event categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.salesByCategory.map((category) => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                            <span className="text-white font-medium">
                              {category.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              LKR {category.revenue.toLocaleString()}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {category.ticketsSold} tickets •{" "}
                              {category.eventCount} events
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Payment Methods
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Revenue breakdown by payment type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="text-white font-medium">
                            Card Payments
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            LKR{" "}
                            {report.paymentMethods.cardPayments.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {report.paymentMethods.cardTransactions}{" "}
                            transactions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-white font-medium">
                            Cash Payments
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            LKR{" "}
                            {report.paymentMethods.cashPayments.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {report.paymentMethods.cashTransactions}{" "}
                            transactions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                          <span className="text-white font-medium">
                            Online Payments
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            LKR{" "}
                            {report.paymentMethods.onlinePayments.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {report.paymentMethods.onlineTransactions}{" "}
                            transactions
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Events Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Top Events by Sales
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Best performing events in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Event
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Date
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Revenue
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Tickets
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Transactions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.topEventsBySales.map((event) => (
                          <tr
                            key={event.eventId}
                            className="border-b border-gray-700/50"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-white font-medium">
                                  {event.eventTitle}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  ID: {event.eventId}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                variant="secondary"
                                className="bg-purple-600/20 text-purple-400"
                              >
                                {event.eventCategory}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-gray-300">
                              {new Date(event.eventDate).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-right text-white font-medium">
                              LKR {event.revenue.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-right text-gray-300">
                              {event.ticketsSold}
                            </td>
                            <td className="py-4 px-4 text-right text-gray-300">
                              {event.transactions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
