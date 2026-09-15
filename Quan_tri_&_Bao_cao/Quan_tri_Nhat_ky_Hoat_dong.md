# Use Case: Quản trị Nhật ký Hoạt động

**Description:** Xem và xuất báo cáo nhật ký hoạt động của hệ thống.

**Precondition:** Quản trị viên đã đăng nhập hệ thống với quyền Admin.

**Postcondition:** Nhật ký hoạt động được truy xuất và xuất báo cáo thành công.

## Actors
- **Quản trị viên**

## Data Entities
- **AuditLog**

## Flows
### ALT: Không tìm thấy dữ liệu
1. Quản trị viên tìm kiếm không có dữ liệu khớp. 2. Hệ thống hiển thị thông báo 'Không tìm thấy nhật ký phù hợp'.

### MAIN: MAIN
1. Quản trị viên truy cập Nhật ký hoạt động. 2. Hệ thống hiển thị danh sách nhật ký theo trình tự thời gian. 3. Quản trị viên sử dụng bộ lọc (theo Actor, Thời gian, hoặc Action) để tìm kiếm. 4. Hệ thống hiển thị kết quả lọc. 5. Quản trị viên xuất báo cáo nhật ký ra tệp (CSV/PDF).

## Business Rules
- Dữ liệu AuditLog phải bao gồm: Timestamp, Actor, Action, TargetEntity, Detail.
- AuditLog không được phép xóa hoặc sửa.

