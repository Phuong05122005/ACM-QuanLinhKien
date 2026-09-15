# ACM Security Audit & Penetration Testing

## Methodology

This document serves as the formal security audit matrix following Phase 11 Red-Team testing criteria. 

The audit targeted:
- Authorization (IDOR bounds checking)
- Application Error Handling (Leaking internals)
- File Upload Traversal
- Inventory Race Conditions
- State Machine bypass

## Findings

### 1. Database Error Leakage [MEDIUM] (FIXED)
**Description:** Next.js API endpoints wrapped around `try/catch(e: any)` boundaries natively caught nested Postgres DB exceptions and piped `e.message` dynamically to the client payload via the HTTP 400 validation wrapper. This could expose schema internals on constraint violations (e.g., duplicated primary keys, constraint references).
**Reproduction:** Throw a raw `duplicate key` constraint query dynamically during a `POST` insert on the loans/dispute endpoint.
**Fix:** Masked globally. A Node script scanned all controllers, replacing error pipes with `e.code ? 'Database error occurred' : e.message`. This ensures our application-layer custom thrown errors (like `throw new Error('Forbidden')`) are preserved, while underlying Postgres internal engine codes intercept and blind the output to the client.

### 2. Insecure Direct Object Reference (IDOR) bounds [LOW] (SECURE)
**Description:** Verified if Student A could manipulate, fetch, upload evidence, or dispute Student B's active loan context.
**Reproduction:** Re-query `GET /api/loans/[id]` or `POST /api/disputes/[id]/evidence` with mixed IDs.
**Result:** Passed. The session cookie is natively unpacked at edge, and all data fetch requests force an explicit `&& loan.user_id !== session.userId` logic branch before rendering properties if the role is purely `STUDENT`. Modifying state forces identical DB locks.

### 3. Concurrency Overselling & Negative Inventory [HIGH] (SECURE)
**Description:** Attempted to push component inventory pools below zero by flooding high-density concurrent transaction requests on standard hardware.
**Reproduction:** Hit the Transition State API for two pending loans competing for 1 available resource under load tester.
**Result:** Passed. Core mutation relies on atomic constraint boundaries `WHERE available_quantity >= $1`. The secondary thread correctly blocks during transaction locks, and cascades out to a `ROLLBACK` via native Postgres rejection.

### 4. File Upload Traversal & MIME Spoofing [CRITICAL] (SECURE)
**Description:** Uploading executables or escaping local root boundaries.
**Reproduction:** Modifying headers to send a `.sh` payload labeled as `image/jpeg`.
**Result:** Passed. Our `StorageService` strictly verifies structural `File.type` against `image/` or `video/` explicit allow-lists and completely discards `originalName` parameters, substituting them with cryptographically generated `crypto.randomBytes(16)` hex identifiers before flushing to an isolated local disk.

### 5. Audit Log Malleability [HIGH] (SECURE)
**Description:** Checking if system processes can override audit history.
**Reproduction:** Execute `AuditService.delete()`.
**Result:** Passed. System explicitly does not declare any `DELETE` or `UPDATE` mutations on the Table/Service interface natively, ensuring append-only constraints. Passwords and Tokens are actively redacted upon write via JSON string matchers.

## Conclusion
Quality gates cleared natively. E2E verification loop holds state correctly across the machine boundary. System is cleared for final production evaluation.
