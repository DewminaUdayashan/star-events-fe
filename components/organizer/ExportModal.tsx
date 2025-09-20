"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Table,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Loader2,
  CheckCircle,
} from "lucide-react";

export type ReportType = "sales" | "revenue" | "events" | "payments";
export type ExportFormat = "pdf" | "excel";
export type DateRange =
  | "last-7-days"
  | "last-30-days"
  | "last-90-days"
  | "this-month"
  | "this-year"
  | "custom";

interface ExportModalProps {
  trigger?: React.ReactNode;
  reportType?: ReportType;
  onExport?: (format: ExportFormat, options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  reportType: ReportType;
  format: ExportFormat;
  dateRange: DateRange;
  customStartDate?: string;
  customEndDate?: string;
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
}

const reportTypeLabels: Record<ReportType, string> = {
  sales: "Sales Report",
  revenue: "Revenue Report",
  events: "Events Performance Report",
  payments: "Payment Methods Report",
};

const reportTypeIcons: Record<ReportType, React.ReactNode> = {
  sales: <DollarSign className="h-4 w-4" />,
  revenue: <DollarSign className="h-4 w-4" />,
  events: <Calendar className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
};

// Helper functions for file downloads
const downloadPDF = async (filename: string, options: ExportOptions) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = `${reportTypeLabels[options.reportType]}`;
    pdf.text(title, margin, yPosition);
    yPosition += 15;

    // Add date and report info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const generatedDate = `Generated: ${new Date().toLocaleDateString()}`;
    pdf.text(generatedDate, margin, yPosition);
    yPosition += 8;

    const dateRange = `Period: ${options.dateRange.replace("-", " ")}`;
    pdf.text(dateRange, margin, yPosition);
    yPosition += 15;

    // Add summary metrics
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary Metrics", margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const metrics = getSummaryMetrics(options.reportType);
    for (const [key, value] of Object.entries(metrics)) {
      pdf.text(`${key}: ${value}`, margin, yPosition);
      yPosition += 6;
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
    }

    yPosition += 15;

    // Add detailed data table
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Data", margin, yPosition);
    yPosition += 10;

    const tableData = getTableData(options.reportType);
    addTableToPDF(pdf, tableData, margin, yPosition, pageWidth);

    // Generate and download PDF
    const pdfBlob = pdf.output("blob");
    saveAs(pdfBlob, filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
};

const downloadExcel = async (filename: string, options: ExportOptions) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = getSummarySheetData(options.reportType);
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Detailed data sheet
    const detailedData = getDetailedSheetData(options.reportType);
    const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, "Details");

    // Generate and download Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, filename);
  } catch (error) {
    console.error("Excel generation failed:", error);
  }
};

const getSummaryMetrics = (reportType: ReportType) => {
  switch (reportType) {
    case "sales":
      return {
        "Total Revenue": "LKR 1,200,000",
        "Total Tickets Sold": "400",
        "Total Transactions": "120",
        "Average Ticket Price": "LKR 3,000",
      };
    case "revenue":
      return {
        "Monthly Revenue": "LKR 1,200,000",
        "Growth Rate": "15.5%",
        "Events This Month": "8",
        "Average per Event": "LKR 150,000",
      };
    case "events":
      return {
        "Total Events": "8",
        "Total Revenue": "LKR 1,200,000",
        "Total Tickets": "400",
        "Average Capacity": "75%",
      };
    case "payments":
      return {
        "Total Transactions": "120",
        "Success Rate": "85%",
        "Total Amount": "LKR 1,200,000",
        "Card Payments": "60%",
      };
    default:
      return {};
  }
};

const getTableData = (reportType: ReportType) => {
  const today = new Date();
  switch (reportType) {
    case "sales":
      return {
        headers: ["Date", "Event", "Tickets Sold", "Revenue"],
        rows: [
          [
            today.toLocaleDateString(),
            "Summer Music Festival",
            "150",
            "LKR 450,000",
          ],
          [
            new Date(Date.now() - 86400000).toLocaleDateString(),
            "Tech Conference",
            "85",
            "LKR 255,000",
          ],
          [
            new Date(Date.now() - 172800000).toLocaleDateString(),
            "Food Expo",
            "120",
            "LKR 360,000",
          ],
        ],
      };
    case "revenue":
      return {
        headers: ["Month", "Revenue", "Growth", "Events"],
        rows: [
          ["September 2024", "LKR 1,200,000", "15.5%", "8"],
          ["August 2024", "LKR 1,040,000", "12.3%", "7"],
          ["July 2024", "LKR 925,000", "8.7%", "6"],
        ],
      };
    case "events":
      return {
        headers: ["Event", "Date", "Category", "Tickets", "Revenue"],
        rows: [
          [
            "Summer Music Festival",
            today.toLocaleDateString(),
            "Music",
            "150",
            "LKR 450,000",
          ],
          [
            "Tech Conference",
            new Date(Date.now() - 86400000).toLocaleDateString(),
            "Technology",
            "85",
            "LKR 255,000",
          ],
          [
            "Food Expo",
            new Date(Date.now() - 172800000).toLocaleDateString(),
            "Food",
            "120",
            "LKR 360,000",
          ],
        ],
      };
    case "payments":
      return {
        headers: ["Transaction ID", "Date", "Amount", "Method", "Status"],
        rows: [
          [
            "TXN12345678",
            today.toLocaleDateString(),
            "LKR 15,000",
            "Credit Card",
            "Completed",
          ],
          [
            "TXN12345679",
            today.toLocaleDateString(),
            "LKR 8,500",
            "PayPal",
            "Completed",
          ],
          [
            "TXN12345680",
            new Date(Date.now() - 86400000).toLocaleDateString(),
            "LKR 22,000",
            "Bank Transfer",
            "Completed",
          ],
        ],
      };
    default:
      return { headers: [], rows: [] };
  }
};

const addTableToPDF = (
  pdf: jsPDF,
  tableData: { headers: string[]; rows: string[][] },
  margin: number,
  yPosition: number,
  pageWidth: number
) => {
  const { headers, rows } = tableData;
  const columnWidth = (pageWidth - 2 * margin) / headers.length;
  let currentY = yPosition;

  // Add headers
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  headers.forEach((header, index) => {
    pdf.text(header, margin + index * columnWidth, currentY);
  });
  currentY += 8;

  // Add rows
  pdf.setFont("helvetica", "normal");
  rows.forEach((row) => {
    row.forEach((cell, index) => {
      pdf.text(cell.toString(), margin + index * columnWidth, currentY);
    });
    currentY += 6;
  });
};

const getSummarySheetData = (reportType: ReportType) => {
  const today = new Date().toLocaleDateString();
  switch (reportType) {
    case "sales":
      return [
        ["Sales Report Summary", "", "", ""],
        ["Generated", today, "", ""],
        ["", "", "", ""],
        ["Metric", "Value", "", ""],
        ["Total Revenue", "LKR 1,200,000", "", ""],
        ["Total Tickets Sold", "400", "", ""],
        ["Total Transactions", "120", "", ""],
        ["Average Ticket Price", "LKR 3,000", "", ""],
      ];
    case "revenue":
      return [
        ["Revenue Report Summary", "", "", ""],
        ["Generated", today, "", ""],
        ["", "", "", ""],
        ["Metric", "Value", "", ""],
        ["Monthly Revenue", "LKR 1,200,000", "", ""],
        ["Growth Rate", "15.5%", "", ""],
        ["Events This Month", "8", "", ""],
        ["Average per Event", "LKR 150,000", "", ""],
      ];
    default:
      return [
        [`${reportType} Report Summary`, "", "", ""],
        ["Generated", today, "", ""],
      ];
  }
};

const getDetailedSheetData = (reportType: ReportType) => {
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  const dayBefore = new Date(Date.now() - 172800000).toLocaleDateString();

  switch (reportType) {
    case "sales":
      return [
        [
          "Date",
          "Event Name",
          "Tickets Sold",
          "Revenue (LKR)",
          "Payment Method",
        ],
        [today, "Summer Music Festival", 150, 450000, "Credit Card"],
        [yesterday, "Tech Conference 2024", 85, 255000, "PayPal"],
        [dayBefore, "Food & Wine Expo", 120, 360000, "Bank Transfer"],
      ];
    case "revenue":
      return [
        ["Month", "Revenue (LKR)", "Growth %", "Events Count"],
        ["September 2024", 1200000, 15.5, 8],
        ["August 2024", 1040000, 12.3, 7],
        ["July 2024", 925000, 8.7, 6],
      ];
    case "events":
      return [
        [
          "Event Name",
          "Date",
          "Category",
          "Tickets Sold",
          "Capacity",
          "Revenue (LKR)",
        ],
        ["Summer Music Festival", today, "Music", 150, 200, 450000],
        ["Tech Conference 2024", yesterday, "Technology", 85, 100, 255000],
        ["Food & Wine Expo", dayBefore, "Food", 120, 150, 360000],
      ];
    case "payments":
      return [
        ["Transaction ID", "Date", "Amount (LKR)", "Payment Method", "Status"],
        ["TXN12345678", today, 15000, "Credit Card", "Completed"],
        ["TXN12345679", today, 8500, "PayPal", "Completed"],
        ["TXN12345680", yesterday, 22000, "Bank Transfer", "Completed"],
      ];
    default:
      return [["No data available"]];
  }
};

const generatePDFContent = (options: ExportOptions): string => {
  // Create a simple HTML content that can be saved as PDF
  // In a real implementation, this would use a PDF library like jsPDF or Puppeteer
  const reportTitle = reportTypeLabels[options.reportType];
  const today = new Date().toLocaleDateString();

  return `export function ExportModal({`;
};

const generateExcelContent = (options: ExportOptions): string => {
  // Generate CSV content with realistic report data
  let csv = "";
  const today = new Date();

  switch (options.reportType) {
    case "sales":
      csv = "Date,Event Name,Tickets Sold,Revenue (LKR),Payment Method\n";
      csv += `${today.toLocaleDateString()},Summer Music Festival,150,450000,Credit Card\n`;
      csv += `${new Date(
        Date.now() - 86400000
      ).toLocaleDateString()},Tech Conference 2024,85,255000,PayPal\n`;
      csv += `${new Date(
        Date.now() - 172800000
      ).toLocaleDateString()},Food & Wine Expo,120,360000,Bank Transfer\n`;
      csv += `${new Date(
        Date.now() - 259200000
      ).toLocaleDateString()},Art Gallery Opening,45,135000,Credit Card\n`;
      break;

    case "revenue":
      csv = "Month,Revenue (LKR),Growth %,Events Count\n";
      csv += "September 2024,1200000,15.5,8\n";
      csv += "August 2024,1040000,12.3,7\n";
      csv += "July 2024,925000,8.7,6\n";
      csv += "June 2024,850000,5.2,5\n";
      break;

    case "events":
      csv = "Event Name,Date,Category,Tickets Sold,Capacity,Revenue (LKR)\n";
      csv += "Summer Music Festival,2024-09-20,Music,150,200,450000\n";
      csv += "Tech Conference 2024,2024-09-19,Technology,85,100,255000\n";
      csv += "Food & Wine Expo,2024-09-18,Food,120,150,360000\n";
      csv += "Art Gallery Opening,2024-09-17,Art,45,80,135000\n";
      break;

    case "payments":
      csv = "Transaction ID,Date,Amount (LKR),Payment Method,Status\n";
      csv += "TXN12345678,2024-09-20,15000,Credit Card,Completed\n";
      csv += "TXN12345679,2024-09-20,8500,PayPal,Completed\n";
      csv += "TXN12345680,2024-09-19,22000,Bank Transfer,Completed\n";
      csv += "TXN12345681,2024-09-19,5500,Credit Card,Failed\n";
      break;

    default:
      csv = "Date,Report Type,Value,Details\n";
      csv += `${today.toLocaleDateString()},${
        options.reportType
      },100,Sample data\n`;
  }

  return csv;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export function ExportModal({
  trigger,
  reportType = "sales",
  onExport,
}: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>(reportType);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRange>("last-30-days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const options: ExportOptions = {
        reportType: selectedReportType,
        format: selectedFormat,
        dateRange: selectedDateRange,
        customStartDate:
          selectedDateRange === "custom" ? customStartDate : undefined,
        customEndDate:
          selectedDateRange === "custom" ? customEndDate : undefined,
        includeCharts,
        includeSummary,
        includeDetails,
      };

      if (onExport) {
        await onExport(selectedFormat, options);
      } else {
        // Default export behavior - create and download actual files
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate filename
        const timestamp = new Date().toISOString().split("T")[0];
        const extension = selectedFormat === "pdf" ? "pdf" : "xlsx";
        const filename = `${selectedReportType}-report-${timestamp}.${extension}`;

        // Create and download the file
        if (selectedFormat === "pdf") {
          await downloadPDF(filename, options);
        } else {
          await downloadExcel(filename, options);
        }
      }

      setExportSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setExportSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-purple-600 hover:bg-purple-700">
      <Download className="h-4 w-4 mr-2" />
      Export Report
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Download className="h-5 w-5 text-purple-400" />
            <span>Export Report</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate and download your report in PDF or Excel format
          </DialogDescription>
        </DialogHeader>

        {exportSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Export Successful!
            </h3>
            <p className="text-gray-400 text-sm">
              Your report has been generated and downloaded.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">
                Report Type
              </Label>
              <Select
                value={selectedReportType}
                onValueChange={(value: ReportType) =>
                  setSelectedReportType(value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {Object.entries(reportTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      <div className="flex items-center space-x-2">
                        {reportTypeIcons[key as ReportType]}
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Export Format
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedFormat("pdf")}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedFormat === "pdf"
                      ? "border-purple-500 bg-purple-500/20 text-white"
                      : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">PDF</p>
                      <p className="text-xs text-gray-400">Formatted report</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFormat("excel")}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedFormat === "excel"
                      ? "border-purple-500 bg-purple-500/20 text-white"
                      : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Table className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Excel</p>
                      <p className="text-xs text-gray-400">Raw data</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">
                Date Range
              </Label>
              <Select
                value={selectedDateRange}
                onValueChange={(value: DateRange) =>
                  setSelectedDateRange(value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="this-year">This year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              {selectedDateRange === "custom" && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs text-gray-400">Start Date</Label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">End Date</Label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-gray-600" />

            {/* Export Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Include in Export
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-summary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(!!checked)}
                    className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Label
                    htmlFor="include-summary"
                    className="text-sm text-gray-300"
                  >
                    Summary statistics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                    className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Label
                    htmlFor="include-charts"
                    className="text-sm text-gray-300"
                  >
                    Charts and visualizations{" "}
                    {selectedFormat === "excel" && (
                      <Badge
                        variant="secondary"
                        className="ml-2 text-xs bg-yellow-600/20 text-yellow-400"
                      >
                        PDF only
                      </Badge>
                    )}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-details"
                    checked={includeDetails}
                    onCheckedChange={(checked) => setIncludeDetails(!!checked)}
                    className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Label
                    htmlFor="include-details"
                    className="text-sm text-gray-300"
                  >
                    Detailed data tables
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={
                  isExporting ||
                  (selectedDateRange === "custom" &&
                    (!customStartDate || !customEndDate))
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
