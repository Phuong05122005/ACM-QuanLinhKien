# Role-Based Access Control (RBAC)

## Roles
The system defines three primary roles:

1. **STUDENT**
2. **ADMIN**
3. **SUPER_ADMIN**

## Permissions

### STUDENT
* View component and kit catalog.
* View own loan history and current loans.
* Request new loans (up to defined limits).
* Generate QR code for pickup/return of own loans.
* Submit disputes for own loans.
* Receive and view own notifications.

### ADMIN
* All STUDENT permissions.
* Approve, reject, or cancel any loan requests.
* Mark loans as ready for pickup.
* Process returns and perform manual inspections.
* Adjust inventory quantities.
* Resolve disputes.
* View system reports and dashboards.
* Manage component and kit definitions.
* Override AI scan decisions.

### SUPER_ADMIN
* All ADMIN permissions.
* Manage user accounts and assign roles.
* Access global system configuration.
* View full system audit logs.
* Execute emergency protocols (e.g., system lockdown).

## Enforcement Rules
* **Mandatory Backend Checks:** Every API endpoint must explicitly verify the user's session and role.
* **Deny by Default:** If a role is not explicitly granted permission, access is denied.
* **No Client Trust:** The frontend UI will hide elements based on role, but the backend must never trust the client to enforce these rules.
