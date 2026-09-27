# Use Case: Quản trị Cấu hình & Thông báo

**Description:** Quản lý các tham số hệ thống và mẫu thông báo.

**Precondition:** Quản trị viên đã đăng nhập hệ thống với quyền Admin.

**Postcondition:** Cấu hình mới được áp dụng cho toàn bộ hệ thống.

## Actors
- **Quản trị viên**

## Data Entities
- **Thông báo**
- **Cấu hình hệ thống**

## Flows
### ALT: Giá trị cấu hình không hợp lệ
1. Quản trị viên nhập giá trị ngoài phạm vi cho phép (ví dụ: thời gian > 7 ngày). 2. Hệ thống hiển thị thông báo cảnh báo 'Giá trị không hợp lệ'. 3. Quản trị viên điều chỉnh lại.

### MAIN: MAIN
1. Quản trị viên truy cập cài đặt hệ thống. 2. Cập nhật các thông số: Thời gian mượn tối đa, cấu hình thông báo tự động cho sinh viên. 3. Hệ thống lưu cấu hình mới. 4. Hệ thống xác nhận đã lưu thành công.

## Business Rules
- Thông báo phải có tiêu đề và nội dung.
- Thời gian cảnh báo quá hạn phải được thiết lập theo giờ.

