# Use Case: Quản lý Đơn mượn

**Description:** Quản trị danh sách và trạng thái các đơn mượn linh kiện.

**Precondition:** Admin đã đăng nhập và có quyền quản trị đơn mượn.

**Postcondition:** Thông tin đơn mượn được cập nhật chính xác trong hệ thống.

## Actors
- **Quản trị viên**

## Data Entities
- **Đơn mượn**

## Flows
### ALT: Không tìm thấy đơn mượn
1. Admin nhập thông tin tìm kiếm không tồn tại.
2. Hệ thống hiển thị thông báo 'Không tìm thấy đơn mượn phù hợp'.

### MAIN: MAIN
1. Admin tìm kiếm đơn mượn theo mã đơn, MSSV, hoặc trạng thái.
2. Hệ thống hiển thị danh sách đơn mượn thỏa mãn điều kiện.
3. Admin chọn một đơn mượn để xem chi tiết.
4. Admin thực hiện cập nhật trạng thái đơn mượn hoặc ghi chú cho đơn mượn.
5. Hệ thống ghi lại lịch sử thay đổi vào AuditLog.
6. Hệ thống hiển thị thông báo cập nhật thành công.

## Business Rules
- Không thể xóa đơn mượn đã có trạng thái Đã nhận.
- Trạng thái đơn mượn chỉ được phép chuyển đổi theo luồng: Đăng ký -> Phê duyệt -> Đã nhận -> Đang mượn -> Đã trả/Quá hạn.
- Mỗi đơn mượn phải có một mã định danh duy nhất.

