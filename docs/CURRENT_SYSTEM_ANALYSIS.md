# Current System Analysis (ACM)

## 1. Project Overview
The Asset & Component Management (ACM) system is currently implemented as a full-stack Next.js 14+ application using TypeScript. The backend runs as Next.js API Routes (`src/app/api`), interacting with a PostgreSQL database via the experimental Prisma ORM v8 (using a JSON contract instead of a standard `schema.prisma`).

## 2. Frontend Analysis
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS with Lucide React icons.
- **State Management:** React hooks (`useState`, `useEffect`) and native `fetch` API.
- **Pages:**
  - `/admin/loans` - Loan management.
  - `/admin/components` & `/admin/kits` - Inventory management.
  - `/admin/qr` - QR code generation and pickup logic.
  - `/admin/ai-inspections` - AI-driven return condition analysis.
  - `/admin/disputes` - Dispute management for damaged items.
  - `/admin/users`, `/admin/settings`, `/admin/audit-logs`, `/admin/emergency` - System admin functionalities.
- **Frontend/Backend Integration:** The frontend expects JSON responses with a consistent envelope:
  - Success: `{ "success": true, "data": ... }`
  - Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`
- **Authentication:** Relies on JWT/Session cookies verified via middleware or a custom `getSession()` utility in `src/lib/auth.ts`.

## 3. Backend Analysis
- **API Routes:** Implemented in `src/app/api`. Use standard RESTful conventions (GET, POST, PATCH).
- **Database Driver:** `@prisma/orm-postgres/runtime` alongside standard `pg` Pool for raw SQL queries (`src/lib/pg.ts`).
- **Security:** Checks roles (`ADMIN`, `SUPER_ADMIN`, `STUDENT`) via `requireRole` and prevents IDOR by matching `session.userId` to resource owners.

## 4. Database Schema (20 Tables)
1. `users`, `roles`, `user_roles` - RBAC and authentication.
2. `component_categories`, `components` - Inventory tracking.
3. `kits`, `kit_components` - Pre-packaged component kits.
4. `inventory_transactions` - Inventory event ledger.
5. `loans`, `loan_items`, `loan_status_histories` - Loan lifecycle management.
6. `qr_codes` - Cryptographic tokens for loan pickups.
7. `ai_scans`, `ai_detected_items`, `ai_reviews` - AI integration for returns.
8. `disputes`, `dispute_evidences` - Dispute resolution.
9. `notifications`, `audit_logs`, `system_configs` - System events and settings.

## 5. Key Workflows Identified
- **Loan Workflow:** Student creates -> Admin approves -> QR Pickup -> Borrowed -> Returned (or AI Inspection -> Dispute).
- **QR Workflow:** Secure, single-use UUIDs tied to `entity_id`.
- **Inventory Safety:** Preventing negative inventory via strict SQL constraints and validations.
- **Audit Logging:** Every mutating action is logged into `audit_logs`.

## 6. Target Java Migration Strategy
The frontend will remain untouched. The existing Next.js API routes will be deactivated or bypassed, and all API calls will be routed to a new Spring Boot 3.x backend running on port 8080 (or similar). The Spring backend will return the exact same JSON shapes expected by the Next.js frontend.
