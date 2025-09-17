import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  SalesReport,
  UserReport,
  EventReport,
  RevenueReport,
  ReportFilters,
} from "../types/api";

export interface DocumentPreview {
  type: "pdf" | "excel";
  blob: Blob;
  url: string;
  filename: string;
}

export class DocumentGeneratorService {
  private static instance: DocumentGeneratorService;

  public static getInstance(): DocumentGeneratorService {
    if (!DocumentGeneratorService.instance) {
      DocumentGeneratorService.instance = new DocumentGeneratorService();
    }
    return DocumentGeneratorService.instance;
  }

  // PDF Generation Methods
  async generateReportPDF(
    reportType: "sales" | "users" | "events" | "revenue",
    data: SalesReport | UserReport | EventReport | RevenueReport,
    filters?: ReportFilters,
    chartElement?: HTMLElement
  ): Promise<DocumentPreview> {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = `${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    } Report`;
    pdf.text(title, margin, yPosition);
    yPosition += 15;

    // Add date and filters
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const generatedDate = `Generated: ${new Date().toLocaleDateString()}`;
    pdf.text(generatedDate, margin, yPosition);
    yPosition += 8;

    if (filters?.startDate && filters?.endDate) {
      const dateRange = `Period: ${filters.startDate} to ${filters.endDate}`;
      pdf.text(dateRange, margin, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    // Add summary metrics
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary Metrics", margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const metrics = this.getSummaryMetrics(reportType, data);
    for (const [key, value] of Object.entries(metrics)) {
      pdf.text(`${key}: ${value}`, margin, yPosition);
      yPosition += 6;

      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
    }

    yPosition += 10;

    // Add chart if provided
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: "#ffffff",
          scale: 2,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.warn("Failed to add chart to PDF:", error);
      }
    }

    // Add detailed data tables
    yPosition += 10;
    this.addDataTables(
      pdf,
      reportType,
      data,
      yPosition,
      margin,
      pageWidth,
      pageHeight
    );

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const filename = `${reportType}-report-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    return {
      type: "pdf",
      blob,
      url,
      filename,
    };
  }

  // Excel Generation Methods
  async generateReportExcel(
    reportType: "sales" | "users" | "events" | "revenue",
    data: SalesReport | UserReport | EventReport | RevenueReport,
    filters?: ReportFilters
  ): Promise<DocumentPreview> {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = this.prepareSummarySheetData(reportType, data, filters);
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Detailed Data Sheets
    this.addDetailedDataSheets(workbook, reportType, data);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const filename = `${reportType}-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return {
      type: "excel",
      blob,
      url,
      filename,
    };
  }

  // Preview Methods
  async previewDocument(preview: DocumentPreview): Promise<void> {
    if (preview.type === "pdf") {
      // Open PDF in new tab for preview
      window.open(preview.url, "_blank");
    } else {
      // For Excel, we'll download directly since most browsers can't preview xlsx
      this.downloadDocument(preview);
    }
  }

  downloadDocument(preview: DocumentPreview): void {
    console.log("Downloading document:", preview.filename);
    try {
      saveAs(preview.blob, preview.filename);
      console.log("Download triggered successfully");
      // Clean up the URL after download
      setTimeout(() => URL.revokeObjectURL(preview.url), 1000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  // Helper Methods
  private getSummaryMetrics(
    reportType: string,
    data: SalesReport | UserReport | EventReport | RevenueReport
  ): Record<string, string> {
    switch (reportType) {
      case "sales":
        const salesData = data as SalesReport;
        return {
          "Total Revenue": `$${
            salesData.totalRevenue?.toLocaleString() || "0"
          }`,
          "Total Tickets Sold":
            salesData.totalTicketsSold?.toLocaleString() || "0",
          "Average Ticket Price": `$${
            salesData.averageTicketPrice?.toFixed(2) || "0"
          }`,
          "Total Transactions":
            salesData.totalTransactions?.toLocaleString() || "0",
        };

      case "users":
        const userData = data as UserReport;
        return {
          "Total Users": userData.totalUsers?.toLocaleString() || "0",
          "Active Users": userData.activeUsers?.toLocaleString() || "0",
          "New Registrations":
            userData.registrationTrend
              ?.reduce((acc, trend) => acc + (trend.newRegistrations || 0), 0)
              ?.toLocaleString() || "0",
          Organizers: userData.organizers?.toLocaleString() || "0",
          Customers: userData.customers?.toLocaleString() || "0",
        };

      case "events":
        const eventData = data as EventReport;
        return {
          "Total Events": eventData.totalEvents?.toLocaleString() || "0",
          "Published Events":
            eventData.publishedEvents?.toLocaleString() || "0",
          "Upcoming Events": eventData.upcomingEvents?.toLocaleString() || "0",
          "Past Events": eventData.pastEvents?.toLocaleString() || "0",
        };

      case "revenue":
        const revenueData = data as RevenueReport;
        return {
          "Total Revenue": `$${
            revenueData.totalRevenue?.toLocaleString() || "0"
          }`,
          "Completed Revenue": `$${
            revenueData.completedRevenue?.toLocaleString() || "0"
          }`,
          "Pending Revenue": `$${
            revenueData.pendingRevenue?.toLocaleString() || "0"
          }`,
          "Net Revenue": `$${revenueData.netRevenue?.toLocaleString() || "0"}`,
        };

      default:
        return {};
    }
  }

  private addDataTables(
    pdf: jsPDF,
    reportType: string,
    data: any,
    startY: number,
    margin: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    let yPosition = startY;

    // Add different tables based on report type
    switch (reportType) {
      case "sales":
        if (data.salesByPeriod?.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text("Sales by Period", margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          data.salesByPeriod.forEach((period: any) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(
              `${period.period}: $${period.revenue} (${period.ticketsSold} tickets)`,
              margin,
              yPosition
            );
            yPosition += 5;
          });
        }
        break;

      case "users":
        if (data.registrationTrend?.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text("Registration Trend", margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          data.registrationTrend.forEach((trend: any) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(
              `${trend.period}: ${trend.newRegistrations} new users`,
              margin,
              yPosition
            );
            yPosition += 5;
          });
        }
        break;

      case "events":
        if (data.eventsByPeriod?.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text("Events by Period", margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          data.eventsByPeriod.forEach((period: any) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(
              `${period.period}: ${period.eventsCreated} created, ${period.eventsPublished} published`,
              margin,
              yPosition
            );
            yPosition += 5;
          });
        }
        break;

      case "revenue":
        if (data.revenueByPeriod?.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text("Revenue by Period", margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          data.revenueByPeriod.forEach((period: any) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(
              `${period.period}: $${period.revenue} total, $${period.completedRevenue} completed`,
              margin,
              yPosition
            );
            yPosition += 5;
          });
        }
        break;
    }
  }

  private prepareSummarySheetData(
    reportType: string,
    data: any,
    filters?: ReportFilters
  ): any[][] {
    const summaryData = [
      [`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
    ];

    if (filters?.startDate && filters?.endDate) {
      summaryData.push([`Period: ${filters.startDate} to ${filters.endDate}`]);
      summaryData.push([]);
    }

    summaryData.push(["Summary Metrics"]);
    summaryData.push(["Metric", "Value"]);

    const metrics = this.getSummaryMetrics(reportType, data);
    Object.entries(metrics).forEach(([key, value]) => {
      summaryData.push([key, value]);
    });

    return summaryData;
  }

  private addDetailedDataSheets(
    workbook: XLSX.WorkBook,
    reportType: string,
    data: any
  ): void {
    switch (reportType) {
      case "sales":
        if (data.salesByPeriod?.length > 0) {
          const salesData = [
            [
              "Period",
              "Revenue",
              "Tickets Sold",
              "Transactions",
              "Average Price",
            ],
            ...data.salesByPeriod.map((period: any) => [
              period.period,
              period.revenue,
              period.ticketsSold,
              period.transactions,
              period.averagePrice || 0,
            ]),
          ];
          const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
          XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales by Period");
        }
        break;

      case "users":
        if (data.registrationTrend?.length > 0) {
          const userData = [
            ["Period", "New Registrations", "New Organizers", "New Customers"],
            ...data.registrationTrend.map((trend: any) => [
              trend.period,
              trend.newRegistrations,
              trend.newOrganizers || 0,
              trend.newCustomers || 0,
            ]),
          ];
          const userSheet = XLSX.utils.aoa_to_sheet(userData);
          XLSX.utils.book_append_sheet(
            workbook,
            userSheet,
            "Registration Trend"
          );
        }
        break;

      case "events":
        if (data.eventsByPeriod?.length > 0) {
          const eventData = [
            ["Period", "Events Created", "Events Published", "Events Held"],
            ...data.eventsByPeriod.map((period: any) => [
              period.period,
              period.eventsCreated,
              period.eventsPublished,
              period.eventsHeld || 0,
            ]),
          ];
          const eventSheet = XLSX.utils.aoa_to_sheet(eventData);
          XLSX.utils.book_append_sheet(
            workbook,
            eventSheet,
            "Events by Period"
          );
        }
        break;

      case "revenue":
        if (data.revenueByPeriod?.length > 0) {
          const revenueData = [
            [
              "Period",
              "Total Revenue",
              "Completed Revenue",
              "Pending Revenue",
              "Transaction Count",
            ],
            ...data.revenueByPeriod.map((period: any) => [
              period.period,
              period.revenue,
              period.completedRevenue,
              period.pendingRevenue,
              period.transactionCount || 0,
            ]),
          ];
          const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
          XLSX.utils.book_append_sheet(
            workbook,
            revenueSheet,
            "Revenue by Period"
          );
        }
        break;
    }
  }
}

export const documentGenerator = DocumentGeneratorService.getInstance();
