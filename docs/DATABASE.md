# Database Schema

## Tables Overview

### users
* `id` (PK, UUID)
* `email` (String, Unique)
* `password_hash` (String)
* `full_name` (String)
* `created_at` (DateTime)
* `updated_at` (DateTime)

### roles
* `id` (PK, UUID)
* `name` (String, Unique) - e.g., STUDENT, ADMIN, SUPER_ADMIN
* `description` (String, Nullable)

### user_roles
* `user_id` (FK to users.id)
* `role_id` (FK to roles.id)
* PK: (user_id, role_id)

### component_categories
* `id` (PK, UUID)
* `name` (String, Unique)
* `description` (String, Nullable)

### components
* `id` (PK, UUID)
* `name` (String)
* `category_id` (FK to component_categories.id)
* `total_quantity` (Int, >= 0)
* `available_quantity` (Int, >= 0)
* `created_at` (DateTime)

### kits
* `id` (PK, UUID)
* `name` (String, Unique)
* `description` (String, Nullable)

### kit_components
* `kit_id` (FK to kits.id)
* `component_id` (FK to components.id)
* `quantity` (Int, > 0)
* PK: (kit_id, component_id)

### qr_codes
* `id` (PK, UUID)
* `code` (String, Unique)
* `entity_type` (String) - e.g., LOAN, COMPONENT, KIT
* `entity_id` (UUID)

### inventory_transactions
* `id` (PK, UUID)
* `component_id` (FK to components.id)
* `quantity_change` (Int) - Positive or negative
* `transaction_type` (String) - e.g., RESTOCK, LOAN, RETURN, ADJUSTMENT
* `reference_id` (UUID, Nullable)
* `created_at` (DateTime)

### loans
* `id` (PK, UUID)
* `user_id` (FK to users.id)
* `status` (String) - PENDING, APPROVED, READY_FOR_PICKUP, BORROWED, OVERDUE, RETURN_REQUIRES_INSPECTION, RETURNED
* `due_date` (DateTime)
* `created_at` (DateTime)
* `updated_at` (DateTime)

### loan_items
* `id` (PK, UUID)
* `loan_id` (FK to loans.id)
* `component_id` (FK to components.id)
* `quantity` (Int, > 0)

### loan_status_histories
* `id` (PK, UUID)
* `loan_id` (FK to loans.id)
* `status` (String)
* `changed_by` (FK to users.id)
* `created_at` (DateTime)
* `notes` (String, Nullable)

### ai_scans
* `id` (PK, UUID)
* `loan_id` (FK to loans.id, Nullable)
* `image_url` (String)
* `status` (String)
* `created_at` (DateTime)

### ai_detected_items
* `id` (PK, UUID)
* `scan_id` (FK to ai_scans.id)
* `detected_component` (String)
* `confidence_score` (Float)

### ai_reviews
* `id` (PK, UUID)
* `scan_id` (FK to ai_scans.id)
* `reviewer_id` (FK to users.id)
* `decision` (String)
* `comments` (String, Nullable)

### disputes
* `id` (PK, UUID)
* `loan_id` (FK to loans.id)
* `user_id` (FK to users.id)
* `status` (String)
* `description` (String)
* `created_at` (DateTime)

### dispute_evidences
* `id` (PK, UUID)
* `dispute_id` (FK to disputes.id)
* `file_url` (String)
* `uploaded_at` (DateTime)

### notifications
* `id` (PK, UUID)
* `user_id` (FK to users.id)
* `type` (String)
* `message` (String)
* `is_read` (Boolean, Default: false)
* `created_at` (DateTime)

### audit_logs
* `id` (PK, UUID)
* `user_id` (FK to users.id, Nullable)
* `action` (String)
* `resource` (String)
* `details` (JSON)
* `ip_address` (String, Nullable)
* `created_at` (DateTime)

### system_configs
* `id` (PK, UUID)
* `key` (String, Unique)
* `value` (JSON)
* `updated_at` (DateTime)

## Invariants
* **CRITICAL:** `components.available_quantity` and `components.total_quantity` must NEVER be negative. Enforced via database constraints and transaction-safe operations.
* **Concurrency:** Critical inventory changes must use transactions with appropriate locking.
