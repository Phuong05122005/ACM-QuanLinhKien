# Use Case: Quản lý danh mục linh kiện

**Description:** Quản lý thêm, sửa, xóa thông tin linh kiện và trạng thái kho.

**Precondition:** Quản trị viên đã đăng nhập hệ thống.

**Postcondition:** Thông tin linh kiện trong kho được cập nhật chính xác.

## Actors
- **Quản trị viên**

## Data Entities
- **KitComponent**

## Flows
### ALT: Invalid Input
Quản trị viên nhập thông tin không hợp lệ (ví dụ: tên trống, số lượng âm). Hệ thống hiển thị thông báo lỗi chi tiết cho từng trường và yêu cầu nhập lại.

### MAIN: MAIN
Quản trị viên truy cập trang quản lý linh kiện. Hệ thống hiển thị danh sách linh kiện hiện có. Quản trị viên chọn 'Thêm mới' hoặc 'Chỉnh sửa' linh kiện. Quản trị viên nhập các thông tin: tên linh kiện, mã định danh, số lượng, trạng thái. Hệ thống kiểm tra dữ liệu đầu vào. Hệ thống lưu thông tin và cập nhật lại danh sách.

## Business Rules
- Trạng thái linh kiện phải là 'Active' hoặc 'Inactive'.
- Số lượng linh kiện không được âm (>= 0).
- Tên linh kiện là bắt buộc.

