export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  imageUrl?: string; // Add imageUrl for compatibility with API responses
  date: string;
  time: string;
  location: string;
  venue: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  organizerId: string;
  organizerName: string;
  organizerImage?: string;
  ticketsAvailable: number;
  totalTickets: number;
  tags: string[];
  featured: boolean;
  trending: boolean;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  ticketTypes: TicketType[];
  isPublished?: boolean; // Add isPublished for consistency
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  total: number;
  benefits: string[];
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  eventCount: number;
}

export interface CartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  event: Event;
  ticketType: TicketType;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "organizer" | "admin";
  avatar?: string;
  phone?: string;
  loyaltyPoints: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  qrCode: string;
  bookingDate: string;
  event: Event;
  ticketType: TicketType;
}
