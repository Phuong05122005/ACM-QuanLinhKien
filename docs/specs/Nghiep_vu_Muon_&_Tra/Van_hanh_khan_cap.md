# Use Case: Vận hành khẩn cấp

**Description:** Vận hành hệ thống trong trường hợp AI hoặc hệ thống mạng gặp sự cố.

**Precondition:** Hệ thống AI hoặc mạng kết nối chính đang gặp sự cố.

**Postcondition:** Giao dịch được ghi nhận thủ công và được gắn nhãn hợp lệ trong hệ thống.

## Actors
- **Quản trị viên**

## Data Entities
- **AuditLog**
- **Component**
- **LoanRecord**

## Flows
### ALT: Đồng bộ dữ liệu sau sự cố
1. Hệ thống phát hiện kết nối mạng được khôi phục.
2. Hệ thống hiển thị cảnh báo cho Admin về các giao dịch đang ở trạng thái 'Manual Override'.
3. Admin chọn 'Đồng bộ dữ liệu' để hệ thống tự động xử lý các cập nhật tồn kho cuối cùng.

### MAIN
1. Admin kích hoạt 'Vận hành khẩn cấp' trên Dashboard.
2. Admin chọn loại hình nghiệp vụ (Mượn/Trả).
3. Admin nhập thủ công Mã đơn (LoanID) hoặc quét mã định danh linh kiện.
4. Admin xác nhận hoàn tất giao dịch.
5. Hệ thống ghi nhận giao dịch vào cơ sở dữ liệu với flag 'Manual Override'.
6. Hệ thống ghi lại hành động vào AuditLog.

## Business Rules
- Hệ thống phải có cơ chế đồng bộ dữ liệu thủ công sau khi khôi phục mạng.
- Mọi thao tác trong chế độ này phải được gắn nhãn 'Manual Override' trong AuditLog.
- Chế độ khẩn cấp chỉ được kích hoạt bởi Admin có quyền cao nhất.

