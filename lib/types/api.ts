// API Types based on OpenAPI specification

import { UserRole } from "@/types/auth";

export interface ApplicationUser {
  id: string;
  userName?: string;
  normalizedUserName?: string;
  email?: string;
  normalizedEmail?: string;
  emailConfirmed: boolean;
  passwordHash?: string;
  securityStamp?: string;
  concurrencyStamp?: string;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd?: string;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  fullName?: string;
  createdAt: string;
  isActive: boolean;
  address?: string;
  dateOfBirth?: string;
  organizationName?: string;
  organizationContact?: string;
  lastLogin?: string;
  tickets?: Ticket[];
  organizedEvents?: Event[];
}

export interface Event {
  createdAt: string;
  modifiedAt?: string;
  deletedAt?: string;
  id: string;
  venueId: string;
  venue: Venue;
  organizerId?: string;
  organizer: ApplicationUser;
  title?: string;
  description?: string;
  eventDate: string;
  eventTime: string;
  category?: string;
  image?: string;
  isPublished: boolean;
  tickets?: Ticket[];
  prices?: EventPrice[];
  imageUrl?: string;
}

export interface EventPrice {
  id: string;
  eventId: string;
  event: Event;
  category?: string;
  stock: number;
  isActive: boolean;
  price: number;
}

export interface Venue {
  createdAt: string;
  modifiedAt?: string;
  deletedAt?: string;
  id: string;
  name?: string;
  location?: string;
  capacity: number;
  events?: Event[];
}

export interface Ticket {
  id: string;
  customerId?: string;
  customer: ApplicationUser;
  eventId: string;
  event: Event;
  eventPriceId: string;
  eventPrice: EventPrice;
  ticketNumber?: string;
  ticketCode?: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
  isPaid: boolean;
  qrCodePath?: string;
}

// Request/Response Types
export interface RegisterRequest {
  email?: string;
  password?: string;
  fullName?: string;
  address?: string;
  dateOfBirth?: string;
  organizationName?: string;
  organizationContact?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: ApplicationUser;
  roles?: UserRole[];
  expiresAt?: string;
}

export interface BookTicketRequest {
  eventId: string;
  eventPriceId: string;
  quantity: number;
  discountCode?: string;
  useLoyaltyPoints: boolean;
}

export interface ProcessPaymentRequest {
  ticketId: string;
  paymentMethod?: string;
  stripeToken?: string;
}

export interface GenerateQrRequest {
  ticketId: string;
}

export interface ApplyPromotionRequest {
  ticketId: string;
  discountCode?: string;
}

export interface UseLoyaltyPointsRequest {
  ticketId: string;
  points: number;
}

// Filter and Search Types
export interface EventFilters {
  fromDate?: string;
  toDate?: string;
  venue?: string;
  venueId?: string;
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Admin specific types
export interface AdminEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventTime: string;
  category?: string;
  image?: string;
  imageUrl?: string;
  isPublished: boolean;
  venueId: string;
  venueName: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizationName?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface AdminEventStatistics {
  totalEvents: number;
  publishedEvents: number;
  unpublishedEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  eventsByCategory: Array<{
    category: string;
    count: number;
  }>;
  topOrganizers: Array<{
    organizerId: string;
    organizerName: string;
    eventCount: number;
  }>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Report Types
export interface SalesReport {
  totalSales: number;
  totalTickets: number;
  eventCount: number;
  period: string;
  revenue: number;
  averageTicketPrice: number;
  topEvents: Array<{
    eventId: string;
    eventTitle: string;
    ticketsSold: number;
    revenue: number;
  }>;
}

export interface UserReport {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  period: string;
  userGrowth: number;
  topOrganizers: Array<{
    organizerId: string;
    organizerName: string;
    eventsCount: number;
    totalRevenue: number;
  }>;
}

export interface EventReport {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  period: string;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface MonitoringReport {
  systemHealth: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  lastUpdated: string;
}

// Organizer Report Types
export interface OrganizerReport {
  organizerId: string;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  period: string;
  events: Array<{
    eventId: string;
    eventTitle: string;
    eventDate: string;
    ticketsSold: number;
    revenue: number;
    status: string;
  }>;
}

// Payment Types
export interface Payment {
  id: string;
  ticketId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
}

// QR Code Types
export interface QRCodeData {
  ticketId: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  customerName: string;
  purchaseDate: string;
  isValid: boolean;
}

// Cart and Booking Types
export interface CartItem {
  eventId: string;
  eventPriceId: string;
  quantity: number;
  price: number;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  category: string;
}

export interface BookingSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  appliedPromotion?: {
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  };
}

// API Response Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Admin Organizer Types
export interface AdminOrganizer {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  organizationName?: string;
  organizationContact?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  totalEvents: number;
  publishedEvents: number;
  unpublishedEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

export interface AdminOrganizerDetail extends AdminOrganizer {
  recentEvents: AdminOrganizerEvent[];
  firstEventDate?: string;
  lastEventDate?: string;
}

export interface AdminOrganizerEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  category: string;
  image?: string;
  imageUrl?: string;
  isPublished: boolean;
  venueId: string;
  venueName: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizationName?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface AdminOrganizerStatistics {
  totalOrganizers: number;
  activeOrganizers: number;
  inactiveOrganizers: number;
  verifiedOrganizers: number;
  unverifiedOrganizers: number;
  organizersWithEvents: number;
  organizersWithoutEvents: number;
  topOrganizers: TopOrganizer[];
  recentRegistrations: RecentOrganizer[];
}

export interface TopOrganizer {
  id: string;
  name: string;
  email: string;
  organizationName?: string;
  eventCount: number;
  publishedEvents: number;
}

export interface RecentOrganizer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  eventCount: number;
}

export interface OrganizerFilters {
  search?: string;
  organizationName?: string;
  hasEvents?: boolean;
}

// Admin Venue Management Types
export interface AdminVenue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  createdAt: string;
  modifiedAt: string | null;
  eventCount: number;
}

export interface CreateVenueRequest {
  name: string;
  location: string;
  capacity: number;
}

export interface UpdateVenueRequest {
  name: string;
  location: string;
  capacity: number;
}

export interface VenueFilters {
  search?: string;
  location?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

export interface VenueEventsCount {
  eventCount: number;
}

// Health Check Types
export interface HealthCheck {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: "healthy" | "unhealthy";
    redis?: "healthy" | "unhealthy";
    external: "healthy" | "unhealthy";
  };
}
