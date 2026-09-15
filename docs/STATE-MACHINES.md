# State Machines

## Loan Lifecycle

The core business process is the lifecycle of a component loan. State transitions must be handled by centralized domain logic to prevent invalid transitions.

### States
* `PENDING` - Loan requested by student, awaiting admin approval.
* `APPROVED` - Loan approved, inventory reserved.
* `READY_FOR_PICKUP` - Kit/Components are packed and ready for the student to pick up (often triggered via QR generation).
* `BORROWED` - Student has picked up the items.
* `OVERDUE` - Loan has exceeded its due date.
* `RETURN_REQUIRES_INSPECTION` - Student has initiated a return, pending AI or human review.
* `RETURNED` - Items successfully returned and inventory restored.

### Valid Transitions
1. `PENDING` -> `APPROVED` (Admin action)
2. `PENDING` -> `RETURNED` (Canceled before approval)
3. `APPROVED` -> `READY_FOR_PICKUP` (Admin/System action)
4. `READY_FOR_PICKUP` -> `BORROWED` (Student pickup via QR)
5. `BORROWED` -> `RETURN_REQUIRES_INSPECTION` (Student returns item)
6. `BORROWED` -> `OVERDUE` (System automated check)
7. `OVERDUE` -> `RETURN_REQUIRES_INSPECTION` (Student returns item late)
8. `RETURN_REQUIRES_INSPECTION` -> `RETURNED` (AI/Admin approves return)

### Invalid Transitions
* `PENDING` directly to `BORROWED`
* `RETURNED` to any other state (Terminal state)
* `BORROWED` to `APPROVED`

## Implementation Rules
* State transitions must be executed within database transactions.
* Corresponding audit logs and history records (`loan_status_histories`) must be created synchronously with the transition.
* Inventory adjustments occur during specific transitions (e.g., reservation on `APPROVED`, restoration on `RETURNED`).
