# StarEvents - Online Event Ticketing Platform

A comprehensive Next.js frontend application for the StarEvents online ticketing platform, built with TypeScript, Tailwind CSS, and modern React patterns.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**
  - JWT-based authentication with secure token storage
  - Role-based access control (Admin, Organizer, Customer)
  - Protected routes and automatic redirects
  - User profile management

- **Event Management**
  - Public event browsing with advanced filtering
  - Event creation and management for organizers
  - Admin event approval and management
  - Real-time event status updates

- **Ticketing System**
  - Multi-step booking flow with cart functionality
  - Multiple pricing tiers per event
  - QR code generation and validation
  - Ticket history and management

- **Payment Integration**
  - Stripe payment processing with secure tokenization
  - Multiple payment methods support
  - Payment history and receipts
  - Refund management

- **Analytics & Reporting**
  - Admin dashboard with comprehensive metrics
  - Organizer analytics and insights
  - Sales reports and user statistics
  - Real-time monitoring

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **State Management**: React Context for global state
- **API Integration**: Centralized API client with automatic JWT handling
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loaders and progress indicators
- **Accessibility**: WCAG compliant components

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Axios with interceptors
- **Payment**: Stripe Elements
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard pages
│   ├── organizer/                # Organizer management pages
│   ├── events/                   # Event browsing and details
│   ├── login/                    # Authentication pages
│   ├── register/
│   ├── checkout/                 # Booking and payment flow
│   ├── my-tickets/               # User ticket management
│   └── layout.tsx                # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── admin/                    # Admin-specific components
│   ├── events/                   # Event-related components
│   ├── payment/                  # Payment components
│   ├── tickets/                  # Ticket components
│   └── layout/                   # Layout components
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   └── CartContext.tsx           # Shopping cart state
├── hooks/                        # Custom React hooks
│   ├── useEvents.ts              # Event-related hooks
│   ├── useTickets.ts             # Ticket-related hooks
│   ├── usePayments.ts            # Payment-related hooks
│   └── useReports.ts             # Analytics hooks
├── lib/                          # Utility libraries
│   ├── services/                 # API service classes
│   ├── types/                    # TypeScript type definitions
│   ├── config.ts                 # Application configuration
│   ├── api-client.ts             # Centralized API client
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Backend API running (see backend documentation)

### Environment Variables
Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=30000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=StarEvents
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LOYALTY_POINTS=true
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 API Integration

### Service Architecture
The application uses a centralized API client with the following services:

- **AuthService**: User authentication and authorization
- **EventsService**: Event management and browsing
- **TicketsService**: Ticket booking and management
- **PaymentService**: Payment processing with Stripe
- **AdminService**: Administrative functions
- **OrganizerService**: Event organizer functions
- **QRService**: QR code generation and validation
- **HealthService**: System health monitoring

### API Client Features
- Automatic JWT token attachment
- Request/response interceptors
- Error handling and retry logic
- Loading state management
- Type-safe API calls

### Custom Hooks
- `useEvents`: Event data fetching and management
- `useTickets`: Ticket operations and history
- `usePayments`: Payment processing
- `useReports`: Analytics and reporting
- `useAuth`: Authentication state management

## 🎨 UI Components

### Component Library
Built on top of Radix UI primitives with custom styling:

- **Form Components**: Input, Select, Textarea, Checkbox, etc.
- **Layout Components**: Card, Sheet, Dialog, Tabs, etc.
- **Feedback Components**: Alert, Toast, Skeleton, etc.
- **Navigation Components**: Navigation, Breadcrumb, Pagination, etc.

### Design System
- **Color Palette**: Purple primary, gray neutrals
- **Typography**: Geist Sans font family
- **Spacing**: Consistent 4px grid system
- **Border Radius**: 8px standard, 16px for cards
- **Shadows**: Subtle elevation system

## 🔐 Security Features

- **JWT Token Management**: Secure storage and automatic refresh
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Built-in Next.js protection
- **Secure Headers**: Content Security Policy
- **Environment Variables**: Sensitive data protection

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-Friendly**: Appropriate touch targets
- **Progressive Enhancement**: Works without JavaScript

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user journey testing
- **Accessibility Tests**: WCAG compliance testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deployment Options
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment platform
- **Docker**: Containerized deployment
- **Self-hosted**: Traditional server deployment

### Environment Configuration
- Set production environment variables
- Configure CDN for static assets
- Set up monitoring and logging
- Configure SSL certificates

## 📊 Performance Optimization

### Core Web Vitals
- **LCP**: Optimized image loading and caching
- **FID**: Minimal JavaScript execution
- **CLS**: Stable layout shifts

### Optimization Techniques
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: API response caching
- **Lazy Loading**: Component and route lazy loading

## 🔧 Development Guidelines

### Code Style
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Standardized commit messages

### Git Workflow
- **Feature Branches**: Isolated feature development
- **Pull Requests**: Code review process
- **Automated Testing**: CI/CD pipeline
- **Semantic Versioning**: Version management

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/Auth/register` - User registration
- `POST /api/Auth/login` - User login
- `POST /api/Auth/logout` - User logout

### Event Endpoints
- `GET /api/Events` - List events with filters
- `GET /api/Events/{id}` - Get event details
- `POST /api/organizer/events` - Create event
- `PUT /api/organizer/events/{id}` - Update event

### Ticket Endpoints
- `POST /api/Tickets/book` - Book tickets
- `GET /api/Tickets/history` - Get ticket history
- `GET /api/Tickets/{id}/qrcode` - Get QR code

### Payment Endpoints
- `POST /api/Payment/process` - Process payment
- `GET /api/Payment/history` - Payment history

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Review Process
- Automated testing must pass
- Code review by maintainers
- Security and performance review
- Documentation updates

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact the development team

### Common Issues
- **API Connection**: Verify backend is running and accessible
- **Environment Variables**: Check all required variables are set
- **Build Errors**: Clear node_modules and reinstall dependencies
- **TypeScript Errors**: Ensure all types are properly defined

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- User authentication and authorization
- Event management and browsing
- Ticket booking and payment processing
- Admin and organizer dashboards
- QR code generation and validation

---

stripe listen --forward-to localhost:3000/api/webhook


**Built with ❤️ for StarEvents by the development team**