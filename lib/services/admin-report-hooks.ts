import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "./admin.service";
import {
  SalesReport,
  UserReport,
  EventReport,
  RevenueReport,
  ReportFilters,
} from "../types/api";

// Sales Report Hooks
export const useAdminSalesReport = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ["admin", "reports", "sales", filters],
    queryFn: () => adminService.getSalesReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes for auto-refresh
  });
};

// Users Report Hooks
export const useAdminUsersReport = (
  filters?: Omit<ReportFilters, "groupBy">
) => {
  return useQuery({
    queryKey: ["admin", "reports", "users", filters],
    queryFn: () => adminService.getUsersReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes for auto-refresh
  });
};

// Events Report Hooks
export const useAdminEventsReport = (
  filters?: Omit<ReportFilters, "groupBy">
) => {
  return useQuery({
    queryKey: ["admin", "reports", "events", filters],
    queryFn: () => adminService.getEventsReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes for auto-refresh
  });
};

// Revenue Report Hooks
export const useAdminRevenueReport = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ["admin", "reports", "revenue", filters],
    queryFn: () => adminService.getRevenueReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes for auto-refresh
  });
};

// PDF Export Hooks
export const useExportReportAsPdf = () => {
  return useMutation({
    mutationFn: async ({
      reportType,
      filters,
    }: {
      reportType: "sales" | "users" | "events" | "revenue";
      filters?: ReportFilters;
    }) => {
      const blob = await adminService.exportReportAsPdf(reportType, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onError: (error) => {
      console.error("PDF export failed:", error);
    },
  });
};

// Excel Export Hooks
export const useExportReportAsExcel = () => {
  return useMutation({
    mutationFn: async ({
      reportType,
      filters,
    }: {
      reportType: "sales" | "users" | "events" | "revenue";
      filters?: ReportFilters;
    }) => {
      const blob = await adminService.exportReportAsExcel(reportType, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onError: (error) => {
      console.error("Excel export failed:", error);
    },
  });
};

// Utility hook for refreshing all reports
export const useRefreshAllReports = () => {
  const queryClient = useQueryClient();

  const refreshAllReports = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
  };

  return { refreshAllReports };
};

// Hook for getting report data preview (for export modal)
export const useReportPreview = (
  reportType: "sales" | "users" | "events" | "revenue",
  filters?: ReportFilters
) => {
  const salesQuery = useAdminSalesReport(
    reportType === "sales" ? filters : undefined
  );
  const usersQuery = useAdminUsersReport(
    reportType === "users"
      ? filters
        ? { startDate: filters.startDate, endDate: filters.endDate }
        : undefined
      : undefined
  );
  const eventsQuery = useAdminEventsReport(
    reportType === "events"
      ? filters
        ? { startDate: filters.startDate, endDate: filters.endDate }
        : undefined
      : undefined
  );
  const revenueQuery = useAdminRevenueReport(
    reportType === "revenue" ? filters : undefined
  );

  switch (reportType) {
    case "sales":
      return {
        data: salesQuery.data,
        isLoading: salesQuery.isLoading,
        error: salesQuery.error,
      };
    case "users":
      return {
        data: usersQuery.data,
        isLoading: usersQuery.isLoading,
        error: usersQuery.error,
      };
    case "events":
      return {
        data: eventsQuery.data,
        isLoading: eventsQuery.isLoading,
        error: eventsQuery.error,
      };
    case "revenue":
      return {
        data: revenueQuery.data,
        isLoading: revenueQuery.isLoading,
        error: revenueQuery.error,
      };
    default:
      return {
        data: undefined,
        isLoading: false,
        error: null,
      };
  }
};
