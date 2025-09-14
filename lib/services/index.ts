// Export all services for easy importing
export { AuthService, useLogin, useRegister, useLogout } from "./auth";
export { authService } from "./auth.service";
export {
  eventsService,
  EventsService,
  useEvents,
  useEvent,
  useTrendingEvents,
  useFeaturedEvents,
} from "./events.service";
export { ticketsService, TicketsService } from "./tickets.service";
export { paymentService, PaymentService } from "./payment.service";
export { organizerService, OrganizerService } from "./organizer.service";
export { adminService, AdminService } from "./admin.service";
export { qrService, QRService } from "./qr.service";
export { healthService, HealthService } from "./health.service";

// Re-export API client
export { apiClient } from "../api-client";

// Re-export types
export * from "../types/api";
