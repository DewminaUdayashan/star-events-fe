"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { useAdminSalesReport } from "@/lib/services";
import { ReportFilters } from "@/lib/types/api";
import {
  ReportExportActions,
  QuickExportButtons,
} from "@/components/ui/report-export-actions";

export default function ExportDemoPage() {
  const [filters] = useState<ReportFilters>({
    startDate: "2025-01-01",
    endDate: "2025-01-23",
    groupBy: "daily",
  });

  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const { data: salesReport, isLoading } = useAdminSalesReport(filters);

  // Mock data for demo - typed as SalesReport
  const mockSalesData = salesReport || {
    totalRevenue: 125000,
    totalTicketsSold: 1250,
    totalTransactions: 350,
    averageTicketPrice: 100,
    salesByPeriod: [
      {
        period: "2025-01-01",
        revenue: 5000,
        ticketsSold: 50,
        transactions: 15,
      },
      {
        period: "2025-01-02",
        revenue: 7500,
        ticketsSold: 75,
        transactions: 22,
      },
      {
        period: "2025-01-03",
        revenue: 6200,
        ticketsSold: 62,
        transactions: 18,
      },
      {
        period: "2025-01-04",
        revenue: 8900,
        ticketsSold: 89,
        transactions: 25,
      },
      {
        period: "2025-01-05",
        revenue: 12000,
        ticketsSold: 120,
        transactions: 35,
      },
    ],
    topEventsBySales: [
      {
        eventId: "1",
        eventTitle: "Music Festival 2025",
        eventCategory: "Music",
        eventDate: "2025-02-15",
        organizerName: "Event Pro LLC",
        revenue: 50000,
        ticketsSold: 500,
        transactions: 150,
      },
      {
        eventId: "2",
        eventTitle: "Tech Conference",
        eventCategory: "Technology",
        eventDate: "2025-03-10",
        organizerName: "Tech Events Inc",
        revenue: 30000,
        ticketsSold: 300,
        transactions: 95,
      },
    ],
    salesByCategory: [
      {
        category: "Music",
        revenue: 60000,
        ticketsSold: 600,
        eventCount: 5,
        averageTicketPrice: 100,
      },
      {
        category: "Technology",
        revenue: 45000,
        ticketsSold: 450,
        eventCount: 3,
        averageTicketPrice: 100,
      },
      {
        category: "Sports",
        revenue: 20000,
        ticketsSold: 200,
        eventCount: 2,
        averageTicketPrice: 100,
      },
    ],
    salesByOrganizer: [
      {
        organizerId: "org1",
        organizerName: "Event Pro LLC",
        revenue: 70000,
        ticketsSold: 700,
        eventCount: 4,
        averageTicketPrice: 100,
      },
      {
        organizerId: "org2",
        organizerName: "Tech Events Inc",
        revenue: 35000,
        ticketsSold: 350,
        eventCount: 2,
        averageTicketPrice: 100,
      },
      {
        organizerId: "org3",
        organizerName: "Sports Central",
        revenue: 20000,
        ticketsSold: 200,
        eventCount: 1,
        averageTicketPrice: 100,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Export Demo - Sales Report
            </h1>
            <p className="text-gray-400">
              Frontend PDF/Excel generation with preview
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex gap-4">
            {/* Full Export with Preview */}
            <ReportExportActions
              reportType="sales"
              data={mockSalesData as any}
              filters={filters}
              chartContainerRef={chartsContainerRef}
            />

            {/* Quick Export (Direct Download) */}
            <QuickExportButtons
              reportType="sales"
              data={mockSalesData as any}
              filters={filters}
              chartContainerRef={chartsContainerRef}
              className="border-l border-gray-600 pl-4"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${mockSalesData.totalRevenue?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Tickets Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {mockSalesData.totalTicketsSold?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Avg Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${mockSalesData.averageTicketPrice?.toFixed(2) || "0"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {mockSalesData.totalTransactions?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - This will be captured in PDF */}
        <div ref={chartsContainerRef} className="space-y-8">
          {/* Revenue Trend Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Revenue Trend
              </CardTitle>
              <CardDescription className="text-gray-400">
                Daily revenue performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSalesData.salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value: any) => [
                        `$${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                      labelStyle={{ color: "#D1D5DB" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Sold Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Tickets Sold</CardTitle>
              <CardDescription className="text-gray-400">
                Daily ticket sales volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSalesData.salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value: any) => [
                        value.toLocaleString(),
                        "Tickets Sold",
                      ]}
                      labelStyle={{ color: "#D1D5DB" }}
                    />
                    <Bar
                      dataKey="ticketsSold"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="bg-gray-800 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Export Features
            </CardTitle>
            <CardDescription className="text-gray-400">
              Frontend document generation capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  PDF Export Features
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    • Professional report formatting with headers and metrics
                  </li>
                  <li>• Chart capture using html2canvas</li>
                  <li>• Detailed data tables with period breakdowns</li>
                  <li>• Preview in new tab before download</li>
                  <li>• Automatic filename with timestamp</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Excel Export Features
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Multiple worksheets (Summary + Detailed Data)</li>
                  <li>• Formatted summary metrics</li>
                  <li>• Raw data export for further analysis</li>
                  <li>• Opens in spreadsheet applications</li>
                  <li>• XLSX format with proper structure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
