// API Types based on OpenAPI specification

export interface ApplicationUser {
  id: string
  userName?: string
  normalizedUserName?: string
  email?: string
  normalizedEmail?: string
  emailConfirmed: boolean
  passwordHash?: string
  securityStamp?: string
  concurrencyStamp?: string
  phoneNumber?: string
  phoneNumberConfirmed: boolean
  twoFactorEnabled: boolean
  lockoutEnd?: string
  lockoutEnabled: boolean
  accessFailedCount: number
  fullName?: string
  createdAt: string
  isActive: boolean
  address?: string
  dateOfBirth?: string
  organizationName?: string
  organizationContact?: string
  lastLogin?: string
  tickets?: Ticket[]
  organizedEvents?: Event[]
}

export interface Event {
  createdAt: string
  modifiedAt?: string
  deletedAt?: string
  id: string
  venueId: string
  venue: Venue
  organizerId?: string
  organizer: ApplicationUser
  title?: string
  description?: string
  eventDate: string
  eventTime: string
  category?: string
  image?: string
  isPublished: boolean
  tickets?: Ticket[]
  prices?: EventPrice[]
}

export interface EventPrice {
  id: string
  eventId: string
  event: Event
  category?: string
  stock: number
  isActive: boolean
  price: number
}

export interface Venue {
  createdAt: string
  modifiedAt?: string
  deletedAt?: string
  id: string
  name?: string
  location?: string
  capacity: number
  events?: Event[]
}

export interface Ticket {
  id: string
  customerId?: string
  customer: ApplicationUser
  eventId: string
  event: Event
  eventPriceId: string
  eventPrice: EventPrice
  ticketNumber?: string
  ticketCode?: string
  quantity: number
  totalAmount: number
  purchaseDate: string
  isPaid: boolean
  qrCodePath?: string
}

// Request/Response Types
export interface RegisterRequest {
  email?: string
  password?: string
  fullName?: string
  address?: string
  dateOfBirth?: string
  organizationName?: string
  organizationContact?: string
}

export interface LoginRequest {
  email?: string
  password?: string
}

export interface LoginResponse {
  token: string
  user: ApplicationUser
  expiresAt: string
}

export interface BookTicketRequest {
  eventId: string
  eventPriceId: string
  quantity: number
  discountCode?: string
  useLoyaltyPoints: boolean
}

export interface ProcessPaymentRequest {
  ticketId: string
  paymentMethod?: string
  stripeToken?: string
}

export interface GenerateQrRequest {
  ticketId: string
}

export interface ApplyPromotionRequest {
  ticketId: string
  discountCode?: string
}

export interface UseLoyaltyPointsRequest {
  ticketId: string
  points: number
}

// Filter and Search Types
export interface EventFilters {
  fromDate?: string
  toDate?: string
  venue?: string
  keyword?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

// Report Types
export interface SalesReport {
  totalSales: number
  totalTickets: number
  eventCount: number
  period: string
}

export interface UserReport {
  totalUsers: number
  activeUsers: number
  newRegistrations: number
  period: string
}
