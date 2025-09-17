"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  useExportReportAsPdf,
  useExportReportAsExcel,
} from "@/lib/services/admin-report-hooks";
import { ReportFilters } from "@/lib/types/api";

interface ExportModalProps {
  reportType: "sales" | "users" | "events" | "revenue";
  filters?: ReportFilters;
  trigger: React.ReactNode;
}

export function ExportModal({
  reportType,
  filters,
  trigger,
}: ExportModalProps) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [previewFilters, setPreviewFilters] = useState<ReportFilters>(
    filters || {}
  );

  const exportPdfMutation = useExportReportAsPdf();
  const exportExcelMutation = useExportReportAsExcel();

  // Use the appropriate hook based on report type (simplified - no preview)
  const previewLoading = false;
  const previewData = null; // Simplified for now

  const handleExport = async () => {
    try {
      if (exportFormat === "pdf") {
        await exportPdfMutation.mutateAsync({
          reportType,
          filters: previewFilters,
        });
      } else {
        await exportExcelMutation.mutateAsync({
          reportType,
          filters: previewFilters,
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const isExporting =
    exportPdfMutation.isPending || exportExcelMutation.isPending;

  const getReportTitle = () => {
    const titles = {
      sales: "Sales Report",
      users: "Users Report",
      events: "Events Report",
      revenue: "Revenue Report",
    };
    return titles[reportType];
  };

  const getPreviewData = () => {
    // Mock data for preview - in a real app, this would come from the actual report data
    switch (reportType) {
      case "sales":
        return {
          metrics: [
            { label: "Total Revenue", value: "$125,430" },
            { label: "Total Sales", value: "1,245" },
            { label: "Average Ticket Price", value: "$95.50" },
          ],
          sections: ["Revenue Trends", "Top Events", "Sales by Category"],
        };
      case "users":
        return {
          metrics: [
            { label: "Total Users", value: "3,456" },
            { label: "Active Users", value: "2,890" },
            { label: "New Registrations", value: "245" },
          ],
          sections: [
            "User Growth Trends",
            "Top Organizers",
            "User Demographics",
          ],
        };
      case "events":
        return {
          metrics: [
            { label: "Total Events", value: "234" },
            { label: "Published Events", value: "198" },
            { label: "Draft Events", value: "36" },
          ],
          sections: [
            "Event Performance",
            "Category Breakdown",
            "Top Organizers",
          ],
        };
      case "revenue":
        return {
          metrics: [
            { label: "Total Revenue", value: "$89,560" },
            { label: "Platform Commissions", value: "$8,956" },
            { label: "Organizer Earnings", value: "$80,604" },
          ],
          sections: ["Revenue Trends", "Payment Methods", "Top Earning Events"],
        };
      default:
        return null;
    }
  };

  const previewInfo = getPreviewData();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export {getReportTitle()}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preview and configure your report export settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger
              value="preview"
              className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Export Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-400">Loading preview...</span>
              </div>
            ) : previewInfo ? (
              <div className="space-y-6">
                {/* Key Metrics Preview */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {previewInfo.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className="text-center p-4 bg-gray-900 rounded-lg"
                        >
                          <div className="text-2xl font-bold text-white">
                            {metric.value}
                          </div>
                          <div className="text-sm text-gray-400">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sections Preview */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Report Sections
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      The following sections will be included in your export
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {previewInfo.sections.map((section, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg"
                        >
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-white">{section}</span>
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-gray-700 text-gray-300"
                          >
                            Included
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export Info */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {exportFormat === "pdf"
                          ? "PDF export will include charts, graphs, and formatted tables"
                          : "Excel export will include raw data in multiple sheets for further analysis"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No preview data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Export Format */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Export Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setExportFormat("pdf")}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === "pdf"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-400" />
                        <div>
                          <h3 className="font-semibold text-white">
                            PDF Report
                          </h3>
                          <p className="text-sm text-gray-400">
                            Formatted report with charts and graphs
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setExportFormat("excel")}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === "excel"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="h-8 w-8 text-green-400" />
                        <div>
                          <h3 className="font-semibold text-white">
                            Excel File
                          </h3>
                          <p className="text-sm text-gray-400">
                            Raw data for analysis and processing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date Range (if applicable) */}
              {(reportType === "sales" || reportType === "revenue") && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Date Range & Grouping
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Group By
                        </label>
                        <Select
                          value={previewFilters.groupBy}
                          onValueChange={(
                            value: "daily" | "weekly" | "monthly" | "yearly"
                          ) =>
                            setPreviewFilters((prev) => ({
                              ...prev,
                              groupBy: value,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Export Range
                        </label>
                        <Select defaultValue="current">
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">
                              Current Filter
                            </SelectItem>
                            <SelectItem value="last-30">
                              Last 30 Days
                            </SelectItem>
                            <SelectItem value="last-90">
                              Last 90 Days
                            </SelectItem>
                            <SelectItem value="last-year">Last Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="bg-gray-700" />

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Export will be downloaded to your device
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  {exportFormat === "pdf" ? (
                    <FileText className="h-4 w-4 mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
