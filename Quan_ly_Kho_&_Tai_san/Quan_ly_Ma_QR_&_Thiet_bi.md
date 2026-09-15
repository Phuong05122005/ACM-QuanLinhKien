# Use Case: Quản lý Mã QR & Thiết bị

**Description:** Quản lý các mã QR định danh cho từng linh kiện hoặc bộ linh kiện (Kit).

**Precondition:** Admin đã đăng nhập.

**Postcondition:** Danh mục mã QR được cập nhật chính xác, đảm bảo tính nhất quán với kho linh kiện.

## Actors
- **Quản trị viên**

## Data Entities
- **Linh kiện**
- **QR_Code**

## Flows
### EXCEPTION: Mã QR trùng lặp
1. Admin nhập mã QR đã tồn tại khi tạo mới.
2. Hệ thống hiển thị lỗi 'Mã QR đã tồn tại'.

### MAIN: MAIN
1. Admin chọn chức năng quản lý QR.
2. Admin thực hiện tạo mới mã QR (liên kết với linh kiện/Kit mới), cập nhật thông tin mã QR hiện có, hoặc vô hiệu hóa mã QR.
3. Hệ thống kiểm tra tính duy nhất của mã QR.
4. Hệ thống lưu thay đổi và ghi lại vào AuditLog.
5. Hệ thống hiển thị thông báo thành công.

## Business Rules
- Mã QR không được phép trùng lặp trong hệ thống.
- Mỗi mã QR phải được gắn với một linh kiện hoặc một Kit linh kiện cụ thể.
- Mã QR phải là duy nhất.

