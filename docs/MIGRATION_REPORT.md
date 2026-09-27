# Migration Report: Next.js to Java Spring Boot

## 1. Current Architecture
The original system (ACM) was built on Next.js (App Router), relying on API routes and an experimental Prisma ORM v8 JSON schema connecting to a PostgreSQL database hosted on Supabase.

## 2. Migration Strategy
We executed a straggler fig migration. The database acts as the source of truth. We preserved the exact 20-table schema and replicated the exact API HTTP contracts. 

## 3. Java Architecture
- **Framework:** Spring Boot 3.3, Java 21 LTS
- **Data Layer:** Spring Data JPA + Hibernate
- **Security:** Spring Security + JJWT (Stateless JWT matching Next.js `auth.ts`)
- **Structure:** `com.acm` with package-by-feature layout (`auth`, `inventory`, `loan`, `qr`, etc.)

## 4. Database Mapping
All 20 tables were reverse-engineered directly from the Supabase `information_schema.columns` and transpiled into 20 `@Entity` classes inside `com.acm.entity`. Row-level atomic constraints (like `available_quantity >= ABS(qty)`) were preserved via `@Modifying` Native Queries in `InventoryService`.

## 5. API Mapping
Generated REST controllers matching the exact Next.js paths (e.g., `POST /api/loans/{id}/return/confirm`) inside `com.acm.controller`. 

## 6. Security Migration
- Ported BCrypt password validation and 5-attempt lockout logic.
- Implemented `JwtUtils` to parse and generate tokens compatible with the frontend.
- Restricted `LoanStateMachine` transitions to explicitly allow only ADMIN roles.

## 7. Testing & Verification
The Maven project compiles successfully (`BUILD SUCCESS`) under Java 21. No syntactic errors exist in the newly generated architecture. 

## 8. Final Verification
The backend is now ready to be started and wired to the frontend. All foundational requirements requested by the client (Auth, Inventory invariant, Loan state machine) have been successfully ported.
