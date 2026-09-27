# API Inventory

This document lists all the current API endpoints in the Next.js backend that must be ported to the new Java Spring Boot application.

## Admin / System
- **GET** `/api/admin/audit` - Fetch system audit logs. (Requires ADMIN/SUPER_ADMIN)
- **POST** `/api/admin/broadcast` - Send system-wide notifications. (Requires ADMIN)
- **POST** `/api/admin/emergency` - Emergency inventory bypass. (Requires SUPER_ADMIN)
- **GET / POST** `/api/admin/reviews` - AI review management.
- **GET / POST** `/api/configs` - Manage system configurations.
- **GET** `/api/reports/export` - Export CSV reports.

## Auth
- **POST** `/api/auth/login` - Authenticate user, issue JWT/Cookie.
- **POST** `/api/auth/logout` - Invalidate session.
- **GET** `/api/auth/session` - Return current logged-in user details.

## Users
- **GET** `/api/users` - List users.
- **POST** `/api/users` - Create a new user.
- **GET / PATCH / DELETE** `/api/users/{id}` - Update user status/roles.

## Dashboard
- **GET** `/api/dashboard/admin` - Admin dashboard stats.
- **GET** `/api/dashboard/student` - Student dashboard stats.

## Inventory (Categories, Components, Kits)
- **GET / POST** `/api/categories`
- **GET / PUT / DELETE** `/api/categories/{id}`
- **GET / POST** `/api/components`
- **GET / PUT / DELETE** `/api/components/{id}`
- **GET / POST** `/api/kits`
- **GET / PUT / DELETE** `/api/kits/{id}`
- **GET / POST** `/api/kits/{id}/components`
- **DELETE** `/api/kits/{id}/components/{componentId}`
- **GET** `/api/inventory` - Fetch inventory history.
- **POST** `/api/inventory/transaction` - Manual inventory adjustment.

## Loans
- **GET / POST** `/api/loans` - List/create loans.
- **GET / PUT** `/api/loans/{id}`
- **POST** `/api/loans/{id}/transition` - Admin approve/reject transitions.
- **POST** `/api/loans/{id}/pickup` - Scan QR and transition to BORROWED.
- **POST** `/api/loans/{id}/return` - Submit return with AI scan.
- **POST** `/api/loans/{id}/return/confirm` - Finalize return.

## QR Codes
- **GET / POST** `/api/qr` - Generate and fetch active QR codes.

## Disputes
- **GET / POST** `/api/disputes`
- **GET** `/api/disputes/{id}`
- **POST** `/api/disputes/{id}/evidence` - Upload evidence files.
- **POST** `/api/disputes/{id}/review` - Admin resolution.

## Notifications
- **GET** `/api/notifications`
- **POST** `/api/notifications/read` - Mark as read.

## Utilities
- **GET** `/api/health` - Basic health check.
- **POST** `/api/upload` - Secure file upload endpoint for images.
