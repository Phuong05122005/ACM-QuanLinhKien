# Use Case: Trả linh kiện

**Description:** Sinh viên trả Kit, hệ thống sử dụng AI để kiểm kê tự động.

**Precondition:** User is logged in, has an active LoanRecord with status 'Borrowed'.

**Postcondition:** LoanRecord status is 'Returned' or 'Returned - Requires Inspection', AuditLog updated, Kit inventory updated.

## Actors
- **AI Vision Service**
- **Sinh viên**

## Data Entities
- **AuditLog**
- **AI_Scan_Result**
- **Kit**
- **LoanRecord**

## Flows
### ALT: AI Discrepancy/Damage Found
1. Hệ thống phát hiện chênh lệch số lượng hoặc hư hỏng linh kiện.
2. Hệ thống hiển thị cảnh báo: "Phát hiện linh kiện thiếu/hư hỏng. Vui lòng xác nhận để hoàn tất trả và chờ kiểm tra từ quản trị viên".
3. Sinh viên xác nhận hoàn tất.
4. Hệ thống cập nhật trạng thái LoanRecord thành "Đã trả - Cần kiểm tra" và lưu cảnh báo vào AuditLog.

### MAIN: Main Flow
1. Sinh viên mở ứng dụng và chọn tính năng "Trả Kit".
2. Hệ thống hiển thị giao diện hướng dẫn chụp ảnh Kit.
3. Sinh viên chụp ảnh nội dung Kit trả.
4. Hệ thống gửi ảnh tới AI Vision Service để phân tích.
5. AI Vision Service trả về kết quả số lượng linh kiện và tình trạng (hư hỏng/đầy đủ).
6. Hệ thống đối chiếu kết quả AI với dữ liệu Kit chuẩn.
7. Hệ thống hiển thị kết quả kiểm kê (số lượng, hư hỏng, mất mát) cho sinh viên.
8. Nếu có vấn đề, hệ thống hiện cảnh báo nhưng vẫn cho phép sinh viên xác nhận trả.
9. Hệ thống cập nhật trạng thái LoanRecord thành "Đã trả", lưu kết quả kiểm kê vào AuditLog.

## Business Rules
- Loan status must be 'Borrowed' to be returned.
- If AI detects discrepancies or damage, flag as 'Requires Inspection' in AuditLog but DO NOT block the return process.

