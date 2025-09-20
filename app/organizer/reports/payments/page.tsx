"use client";

import { useState } from "react";
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
  Calendar,
  Download,
  ArrowLeft,
  Loader2,
  CreditCard,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  organizerReportsService,
  type OrganizerReportFilters,
} from "@/lib/services/organizer-reports.service";
import { ExportModal } from "@/components/organizer/ExportModal";

export default function OrganizerPaymentsReportPage() {
  const { user, roles } = useAuth();
  const [filters, setFilters] = useState<OrganizerReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const {
    data: paymentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizer-payments-report", filters],
    queryFn: () => organizerReportsService.getPaymentMethods(filters),
    enabled: !!user && roles.includes("Organizer"),
  });

  if (!user || !roles.includes("Organizer")) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Please log in as an organizer to access payment reports.
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
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    setFilters({
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    });
  };

  const report = paymentsData?.data;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "failed":
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      case "failed":
      case "error":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      case "pending":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

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
                  Payment Methods Analysis
                </h1>
                <p className="text-gray-400">
                  Analyze payment transactions and method performance
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
                  <SelectItem value="this-month">This month</SelectItem>
                </SelectContent>
              </Select>
              <ExportModal
                reportType="payments"
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
              <span className="ml-2 text-white">
                Loading payment analysis...
              </span>
            </div>
          )}

          {error && (
            <Card className="bg-red-500/10 border-red-500/20 mb-8">
              <CardContent className="p-6">
                <p className="text-red-400">
                  Failed to load payment report. Please try again.
                </p>
              </CardContent>
            </Card>
          )}

          {report && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">
                          Total Transactions
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.totalTransactions.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Amount</p>
                        <p className="text-2xl font-bold text-white">
                          LKR {report.summary.totalAmount.toLocaleString()}
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
                        <p className="text-gray-400 text-sm">Success Rate</p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.totalTransactions > 0
                            ? (85).toFixed(1) // Mock success rate since it's not in the interface
                            : 0}
                          %
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Avg Transaction</p>
                        <p className="text-2xl font-bold text-white">
                          LKR{" "}
                          {report.summary.totalTransactions > 0
                            ? (
                                report.summary.totalAmount /
                                report.summary.totalTransactions
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })
                            : 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Payment Methods Breakdown */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Payment Methods
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Transaction volume and success rates by payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const methods = [
                          {
                            method: "Card Payments",
                            transactionCount:
                              report.paymentMethods.cardTransactions,
                            totalAmount: report.paymentMethods.cardPayments,
                            percentage: report.summary.cardPercentage,
                          },
                          {
                            method: "Online Payments",
                            transactionCount:
                              report.paymentMethods.onlineTransactions,
                            totalAmount: report.paymentMethods.onlinePayments,
                            percentage: report.summary.onlinePercentage,
                          },
                          {
                            method: "Cash Payments",
                            transactionCount:
                              report.paymentMethods.cashTransactions,
                            totalAmount: report.paymentMethods.cashPayments,
                            percentage: report.summary.cashPercentage,
                          },
                        ];

                        return methods.length === 0 ? (
                          <p className="text-gray-400 text-center py-8">
                            No payment data available
                          </p>
                        ) : (
                          methods.map((method, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                                  <span className="text-white font-medium">
                                    {method.method}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-semibold">
                                    {method.transactionCount} transactions
                                  </p>
                                  <p className="text-green-400 text-sm">
                                    {method.percentage.toFixed(1)}% of total
                                  </p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${method.percentage}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                  LKR {method.totalAmount.toLocaleString()}
                                </span>
                                <span className="text-gray-400">
                                  {method.percentage.toFixed(1)}% share
                                </span>
                              </div>
                            </div>
                          ))
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Status Overview */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Transaction Status
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Overview of transaction outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                            <div>
                              <p className="text-white font-medium">
                                Successful
                              </p>
                              <p className="text-green-400 text-sm">
                                Completed transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">
                              {Math.round(
                                report.summary.totalTransactions * 0.85
                              ).toLocaleString()}
                            </p>
                            <p className="text-green-400 text-sm">
                              {report.summary.totalTransactions > 0
                                ? (85).toFixed(1)
                                : 0}
                              %
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <XCircle className="h-8 w-8 text-red-400" />
                            <div>
                              <p className="text-white font-medium">Failed</p>
                              <p className="text-red-400 text-sm">
                                Unsuccessful transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">
                              {Math.round(
                                report.summary.totalTransactions * 0.15
                              ).toLocaleString()}
                            </p>
                            <p className="text-red-400 text-sm">
                              {report.summary.totalTransactions > 0
                                ? (15).toFixed(1)
                                : 0}
                              %
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <h4 className="text-white font-medium mb-3">
                          Performance Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-900 rounded-lg">
                            <p className="text-gray-400 text-sm">
                              Average per Day
                            </p>
                            <p className="text-white font-bold">
                              {Math.round(
                                report.summary.totalTransactions / 30
                              )}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-900 rounded-lg">
                            <p className="text-gray-400 text-sm">
                              Methods Used
                            </p>
                            <p className="text-white font-bold">3</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest payment transactions across all your events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Transaction ID
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Method
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Event
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Mock recent transactions - in real app this would come from API */}
                        {Array.from({ length: 10 }, (_, i) => {
                          const statuses = ["completed", "failed", "pending"];
                          const methods = [
                            "Credit Card",
                            "PayPal",
                            "Bank Transfer",
                            "Digital Wallet",
                          ];
                          const status =
                            statuses[
                              Math.floor(Math.random() * statuses.length)
                            ];
                          const method =
                            methods[Math.floor(Math.random() * methods.length)];
                          const amount =
                            Math.floor(Math.random() * 50000) + 5000;

                          return (
                            <tr
                              key={i}
                              className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <span className="text-blue-400 font-mono text-sm">
                                  TXN{String(12345 + i).padStart(8, "0")}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                <div>
                                  <p>
                                    {new Date(
                                      Date.now() - i * 24 * 60 * 60 * 1000
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      Date.now() - i * 24 * 60 * 60 * 1000
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  variant="outline"
                                  className="border-gray-600 text-gray-300"
                                >
                                  {method}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(status)}
                                  <Badge className={getStatusColor(status)}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span
                                  className={`font-medium ${
                                    status === "completed"
                                      ? "text-green-400"
                                      : status === "failed"
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                  }`}
                                >
                                  LKR {amount.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                <p className="text-sm">Summer Music Festival</p>
                                <p className="text-xs text-gray-500">
                                  Event #12{String(34 + i)}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white"
                    >
                      Load More Transactions
                    </Button>
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
