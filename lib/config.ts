// Application Configuration
export const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  },

  // Stripe Configuration
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // Application Settings
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'StarEvents',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: '1.0.0',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    loyaltyPoints: process.env.NEXT_PUBLIC_ENABLE_LOYALTY_POINTS === 'true',
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // Currency
  currency: {
    code: 'LKR',
    symbol: 'LKR',
    decimals: 2,
  },

  // Date Formats
  dateFormats: {
    display: 'MMM dd, yyyy',
    api: 'yyyy-MM-dd',
    datetime: 'MMM dd, yyyy HH:mm',
  },

  // File Upload
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Cache
  cache: {
    events: 5 * 60 * 1000, // 5 minutes
    user: 10 * 60 * 1000, // 10 minutes
    reports: 30 * 60 * 1000, // 30 minutes
  },
}

// Validation schemas
export const validationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ticketCode: /^[A-Z0-9]{8,12}$/,
}

// API Endpoints
export const endpoints = {
  auth: {
    login: '/api/Auth/login',
    register: '/api/Auth/register',
    logout: '/api/Auth/logout',
    me: '/api/Auth/me',
  },
  events: {
    list: '/api/Events',
    detail: (id: string) => `/api/Events/${id}`,
  },
  admin: {
    events: '/api/admin/events',
    event: (id: string) => `/api/admin/events/${id}`,
    users: '/api/admin/users',
    user: (id: string) => `/api/admin/users/${id}`,
    venues: '/api/admin/venues',
    venue: (id: string) => `/api/admin/venues/${id}`,
    dashboard: '/api/admin/dashboard',
    stats: '/api/admin/stats',
  },
  organizer: {
    events: '/api/organizer/events',
    event: (id: string) => `/api/organizer/events/${id}`,
    dashboard: '/api/organizer/dashboard',
    analytics: (id: string) => `/api/organizer/events/${id}/analytics`,
  },
  tickets: {
    book: '/api/Tickets/book',
    detail: (id: string) => `/api/Tickets/${id}`,
    history: '/api/Tickets/history',
    qrCode: (id: string) => `/api/Tickets/${id}/qrcode`,
    validate: (code: string) => `/api/Tickets/validate/${code}`,
    promotions: '/api/Tickets/promotions',
    loyaltyPoints: '/api/Tickets/loyalty-points',
  },
  payments: {
    process: '/api/Payment/process',
    history: '/api/Payment/history',
    detail: (id: string) => `/api/Payment/${id}`,
    webhook: '/api/Payment/webhook',
    createIntent: '/api/Payment/create-intent',
    confirm: '/api/Payment/confirm',
  },
  qr: {
    generate: '/api/Qr/generate',
    detail: (code: string) => `/api/Qr/${code}`,
    validate: (code: string) => `/api/Qr/validate/${code}`,
  },
  reports: {
    organizer: '/api/Reports/organizer',
    adminSales: '/api/Reports/admin/sales',
    adminUsers: '/api/Reports/admin/users',
    adminEvents: '/api/Reports/admin/events',
    adminMonitoring: '/api/Reports/admin/monitoring',
  },
  health: {
    check: '/api/Health',
    ping: '/api/Health/ping',
    ready: '/api/Health/ready',
    live: '/api/Health/live',
  },
}

// Error Messages
export const errorMessages = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  payment: 'Payment processing failed. Please try again.',
  booking: 'Ticket booking failed. Please try again.',
  generic: 'Something went wrong. Please try again.',
}

// Success Messages
export const successMessages = {
  login: 'Successfully logged in.',
  register: 'Account created successfully.',
  logout: 'Successfully logged out.',
  eventCreated: 'Event created successfully.',
  eventUpdated: 'Event updated successfully.',
  eventDeleted: 'Event deleted successfully.',
  ticketBooked: 'Ticket booked successfully.',
  paymentProcessed: 'Payment processed successfully.',
  profileUpdated: 'Profile updated successfully.',
}

// Event Categories
export const eventCategories = [
  'Concert',
  'Theatre',
  'Cultural',
  'Sports',
  'Conference',
  'Workshop',
  'Exhibition',
  'Festival',
  'Comedy',
  'Dance',
  'Music',
  'Art',
  'Technology',
  'Business',
  'Education',
  'Health',
  'Food & Drink',
  'Other',
]

// User Roles
export const userRoles = {
  ADMIN: 'Admin',
  ORGANIZER: 'Organizer',
  CUSTOMER: 'Customer',
} as const

export type UserRole = keyof typeof userRoles

// Ticket Status
export const ticketStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
} as const

export type TicketStatus = keyof typeof ticketStatus

// Payment Status
export const paymentStatus = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
} as const

export type PaymentStatus = keyof typeof paymentStatus
