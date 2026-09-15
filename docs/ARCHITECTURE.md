# ACM Architecture

## Application Type
Modular Monolith

## Tech Stack
* **Framework:** Next.js
* **UI Library:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validation:** Zod
* **Authentication:** Secure server-side authentication/session
* **Testing:** Vitest/Jest, Playwright

## Provider-Independent Abstractions
The system architecture will decouple the application logic from external service providers using interfaces for:
* **AI:** Abstract AI models/services for item detection and inspection.
* **Storage:** Abstract file and blob storage for uploaded assets.
* **Notifications:** Abstract notification delivery (email, SMS, in-app).
* **Reports:** Abstract report generation engines.

## Domain Modules
The monolithic application will be divided into the following cohesive domain modules:
* `auth` - Authentication and session management
* `users` - User profile and lifecycle management
* `categories` - Component categories management
* `components` - Component catalog and metadata
* `kits` - Kit configuration and composition
* `inventory` - Real-time inventory tracking and transactions
* `qr` - QR code generation and resolution
* `loans` - Loan lifecycle and requests
* `pickup` - Loan fulfillment and pickup workflows
* `returns` - Component return and inspection workflows
* `ai` - AI-driven component review and detection
* `disputes` - Loan and return dispute resolution
* `notifications` - System and user alerts
* `audit` - System-wide audit logging
* `reports` - Dashboard and data exports
* `config` - System configuration
* `emergency` - Emergency operations and overrides

## Principles
* **No Microservices:** Maintain a single deployable unit unless explicitly requested.
* **Strict Module Boundaries:** Modules should communicate via clear interfaces/services.
* **Server-Side Trust:** All critical business rules, especially authorization and inventory checks, are enforced on the backend.
