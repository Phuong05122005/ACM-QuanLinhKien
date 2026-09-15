# Security Model

## Authentication
* Secure server-side session management.
* Passwords must be securely hashed (e.g., Argon2 or bcrypt).
* Sessions must expire and support revocation.

## Authorization & RBAC
* All API routes and mutations must verify the user's role and permissions.
* Never trust client-provided IDs for authorization.
* UI hiding is NOT authorization. Backend checks are mandatory.

## IDOR Prevention
* Ensure that the authenticated user has ownership or appropriate administrative privileges before accessing or modifying any resource (e.g., loans, disputes, profiles).

## Input Validation
* All incoming data must be validated using `Zod` schemas.
* Never trust client-provided values (e.g., inventory counts, status strings).

## File Upload Security
* Validate MIME types and extensions.
* Enforce strict size limits.
* Rename files to safe, randomized names (e.g., UUIDs).
* Store uploads in private, secure storage.
* NEVER allow executable uploads.

## Mass Assignment Prevention
* Explicitly pick/whitelist fields from request payloads when creating or updating database records.

## General Web Security
* **CSRF:** Implement CSRF tokens for state-changing operations if relying on cookies.
* **XSS:** Use React's default escaping. Sanitize any rich text input.
* **SQL Injection:** Prevented by using the Prisma ORM.
* **Rate Limiting:** Apply rate limiting to critical endpoints (login, dispute creation).

## Audit & Secrets
* **Audit Logging:** Log all critical actions (auth events, inventory mutations, status changes).
* **Secrets:** Never expose API keys, tokens, or secrets in client-side code or logs.

## Error Handling
* Standardize API error responses.
* Never expose stack traces or internal system details to the client.
