# Testing Strategy

## Overview
A comprehensive testing strategy is required to ensure production readiness, security, and data integrity.

## Unit Testing
* **Scope:** Domain functions, utilities, state machine logic, validation schemas, and isolated React components.
* **Tools:** Vitest / Jest.
* **Requirements:** All critical business rules (e.g., loan state transitions, inventory calculations) must have thorough unit tests.

## Integration Testing
* **Scope:** API routes, database operations, and module interactions.
* **Tools:** Vitest / Jest + test database (e.g., isolated PostgreSQL instance or transaction rollbacks).
* **Requirements:** Verify that API contracts are met and database constraints (like non-negative inventory) are enforced.

## End-to-End (E2E) Testing
* **Scope:** Critical user journeys (Login, Requesting a Loan, Admin Approval, Pickup via QR, Return via AI).
* **Tools:** Playwright.
* **Requirements:** Run against a fully built application environment with a seeded test database.

## Security & Concurrency Testing
* **Security:** Verify RBAC enforcement, input sanitization, and IDOR prevention during integration testing.
* **Concurrency:** Write specific tests to simulate simultaneous requests (e.g., multiple users requesting the last item in inventory) to ensure database transactions and locks prevent negative inventory or double-booking.

## Phase Gate Requirements
Before any development phase is considered complete, the following must pass:
* Typecheck (`tsc --noEmit`)
* Linting (`eslint`)
* Unit & Integration Tests
* Build (`next build`)
