import { apiClient } from "../api-client";

// Interface for organizer sales report
export interface OrganizerSalesReport {
  organizerId: string;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  report: {
    totalRevenue: number;
    totalTicketsSold: number;
    totalTransactions: number;
    averageTicketPrice: number;
    topEventsBySales: Array<{
      eventId: string;
      eventTitle: string;
      eventCategory: string;
      eventDate: string;
      organizerName: string;
      revenue: number;
      ticketsSold: number;
      transactions: number;
    }>;
    salesByCategory: Array<{
      category: string;
      revenue: number;
      ticketsSold: number;
      eventCount: number;
      averageTicketPrice: number;
    }>;
    paymentMethods: {
      cardPayments: number;
      cashPayments: number;
      onlinePayments: number;
      cardTransactions: number;
      cashTransactions: number;
      onlineTransactions: number;
    };
  };
  generatedAt: string;
}

// Interface for monthly revenue breakdown
export interface OrganizerMonthlyRevenue {
  organizerId: string;
  year: number;
  revenueByMonth: Record<string, number>;
  totalRevenue: number;
  generatedAt: string;
}

// Interface for event performance metrics
export interface OrganizerEventPerformance {
  organizerId: string;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  events: Array<{
    eventId: string;
    eventTitle: string;
    eventCategory: string;
    eventDate: string;
    organizerName: string;
    revenue: number;
    ticketsSold: number;
    transactions: number;
  }>;
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  generatedAt: string;
}

// Interface for sales by period
export interface OrganizerSalesByPeriod {
  organizerId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  periodType: "daily" | "weekly" | "monthly";
  salesByPeriod: Array<{
    period: string;
    revenue: number;
    ticketsSold: number;
    transactions: number;
  }>;
  totalRevenue: number;
  totalTicketsSold: number;
  totalTransactions: number;
  generatedAt: string;
}

// Interface for payment methods analysis
export interface OrganizerPaymentMethods {
  organizerId: string;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  paymentMethods: {
    cardPayments: number;
    cashPayments: number;
    onlinePayments: number;
    cardTransactions: number;
    cashTransactions: number;
    onlineTransactions: number;
  };
  summary: {
    totalAmount: number;
    totalTransactions: number;
    cardPercentage: number;
    cashPercentage: number;
    onlinePercentage: number;
  };
  generatedAt: string;
}

// Interface for event summary dashboard
export interface OrganizerEventSummary {
  organizerId: string;
  eventSummary: Array<{
    eventId: string;
    title: string;
    status: "Past" | "Upcoming" | "Ongoing";
    eventDate: string;
    totalCapacity: number;
    ticketsSold: number;
    salesPercentage: number;
    revenue: number;
  }>;
  statistics: {
    totalEvents: number;
    publishedEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    totalRevenue: number;
    totalTicketsSold: number;
    averageCapacityUtilization: number;
  };
  monthlyRevenue: Record<string, number>;
  generatedAt: string;
}

// Report filters interface
export interface OrganizerReportFilters {
  startDate?: string;
  endDate?: string;
  periodType?: "daily" | "weekly" | "monthly";
}

export class OrganizerReportsService {
  // Get comprehensive sales report
  async getSalesReport(filters?: OrganizerReportFilters): Promise<{
    success: boolean;
    data: OrganizerSalesReport;
    message: string;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<{
      success: boolean;
      data: OrganizerSalesReport;
      message: string;
    }>(`/api/Reports/my-sales?${params.toString()}`);

    return response;
  }

  // Get monthly revenue breakdown
  async getMonthlyRevenue(year: number): Promise<{
    success: boolean;
    data: OrganizerMonthlyRevenue;
    message: string;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: OrganizerMonthlyRevenue;
      message: string;
    }>(`/api/Reports/my-revenue/monthly/${year}`);

    return response;
  }

  // Get event performance metrics
  async getEventPerformance(filters?: OrganizerReportFilters): Promise<{
    success: boolean;
    data: OrganizerEventPerformance;
    message: string;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<{
      success: boolean;
      data: OrganizerEventPerformance;
      message: string;
    }>(`/api/Reports/my-events/performance?${params.toString()}`);

    return response;
  }

  // Get sales by period
  async getSalesByPeriod(filters?: OrganizerReportFilters): Promise<{
    success: boolean;
    data: OrganizerSalesByPeriod;
    message: string;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.periodType) params.append("periodType", filters.periodType);

    const response = await apiClient.get<{
      success: boolean;
      data: OrganizerSalesByPeriod;
      message: string;
    }>(`/api/Reports/my-sales/by-period?${params.toString()}`);

    return response;
  }

  // Get payment methods analysis
  async getPaymentMethods(filters?: OrganizerReportFilters): Promise<{
    success: boolean;
    data: OrganizerPaymentMethods;
    message: string;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<{
      success: boolean;
      data: OrganizerPaymentMethods;
      message: string;
    }>(`/api/Reports/my-payments/methods?${params.toString()}`);

    return response;
  }

  // Get event summary dashboard
  async getEventSummary(): Promise<{
    success: boolean;
    data: OrganizerEventSummary;
    message: string;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: OrganizerEventSummary;
      message: string;
    }>(`/api/Reports/my-events/summary`);

    return response;
  }
}

export const organizerReportsService = new OrganizerReportsService();
