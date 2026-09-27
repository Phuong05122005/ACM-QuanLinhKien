# Database Mapping (PostgreSQL -> Java JPA)

This document maps the existing 20 tables in the public PostgreSQL schema to their corresponding Java JPA Entities.

## Global Conventions
- All IDs are UUIDs (`@Id @GeneratedValue(strategy = GenerationType.UUID)`).
- Timestamps are `OffsetDateTime` (`timestamp with time zone`).
- Enums should be mapped using `@Enumerated(EnumType.STRING)`.
- Base entity can be used for `createdAt` and `updatedAt`.

## 1. Users & Auth
**`users`** -> `User.java`
- `id`, `username`, `password_hash`, `email`, `full_name`, `student_code`, `is_active`, `failed_attempts`, `locked_until`.

**`roles`** -> `Role.java`
- `id`, `name`, `description`.

**`user_roles`** -> `UserRole.java` (or `@ManyToMany` on `User`)
- `user_id`, `role_id`.

## 2. Inventory
**`component_categories`** -> `ComponentCategory.java`
- `id`, `name`, `description`.

**`components`** -> `Component.java`
- `id`, `identifier`, `name`, `description`, `image_url`, `total_quantity`, `available_quantity`, `category_id`.
- Foreign Key: `category_id` -> `ComponentCategory`.

**`kits`** -> `Kit.java`
- `id`, `kit_code`, `name`, `description`.

**`kit_components`** -> `KitComponent.java`
- `kit_id`, `component_id`, `expected_quantity`.

**`inventory_transactions`** -> `InventoryTransaction.java`
- `id`, `component_id`, `transaction_type`, `quantity_change`, `reference_id`, `notes`.

## 3. Loans
**`loans`** -> `Loan.java`
- `id`, `loan_code`, `user_id`, `kit_id`, `status`, `notes`, `due_date`.

**`loan_items`** -> `LoanItem.java`
- `id`, `loan_id`, `component_id`, `quantity`.

**`loan_status_histories`** -> `LoanStatusHistory.java`
- `id`, `loan_id`, `status`, `changed_by`, `notes`.

## 4. Workflows & Security
**`qr_codes`** -> `QrCode.java`
- `id`, `code`, `entity_type`, `entity_id`, `is_active`.

**`audit_logs`** -> `AuditLog.java`
- `id`, `user_id`, `action`, `resource`, `resource_id`, `details`, `ip_address`.

**`system_configs`** -> `SystemConfig.java`
- `id`, `key`, `value`, `description`, `updated_by`.

**`notifications`** -> `Notification.java`
- `id`, `user_id`, `type`, `message`, `metadata`, `is_read`.

## 5. AI & Disputes
**`ai_scans`** -> `AiScan.java`
- `id`, `loan_id`, `image_url`, `status`, `result`.

**`ai_detected_items`** -> `AiDetectedItem.java`
- `id`, `scan_id`, `detected_component`, `condition`, `quantity`, `confidence_score`.

**`ai_reviews`** -> `AiReview.java`
- `id`, `scan_id`, `reviewer_id`, `decision`, `comments`.

**`disputes`** -> `Dispute.java`
- `id`, `loan_id`, `user_id`, `status`, `reason`, `description`, `admin_notes`, `deadline`.

**`dispute_evidences`** -> `DisputeEvidence.java`
- `id`, `dispute_id`, `file_name`, `file_url`, `uploaded_by`, `uploaded_at`.
