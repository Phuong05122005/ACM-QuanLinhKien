# Reference Analysis

## Overview
An inspection of the current repository was performed during the Phase 0 Discovery.

### Repository Findings
The repository primarily contains a set of business requirement use cases documented in Vietnamese under various operational directories:
- `AI_&_Kiem_soat_Chat_luong/` (AI & Quality Control)
- `Nghiep_vu_Muon_&_Tra/` (Borrowing & Returning Operations)
- `Quan_ly_Kho_&_Tai_san/` (Warehouse & Asset Management)
- `Quan_ly_Nguoi_dung/` (User Management)
- `Quan_tri_&_Bao_cao/` (Administration & Reporting)
- `AGENTS.md` (Engineering rules for ACM)

### UI/UX Reference Analysis
**No existing UI/UX reference materials (HTML, images, design files, ZIPs) were found in the repository.**

As a result:
- There is no legacy UI to blindly copy.
- The new UI will be designed from scratch based on modern best practices using React and Tailwind CSS.
- The design will focus on clean information hierarchy, responsive behavior, and clear terminology as dictated by the domain modules.

### Target Production Architecture vs Reference
Since the existing materials are purely business requirements and engineering rules, they serve as inputs for the **Target Production Architecture** rather than constraints on the UI. The target architecture will adhere strictly to the `AGENTS.md` rules and the modular monolith approach outlined in the project requirements.
