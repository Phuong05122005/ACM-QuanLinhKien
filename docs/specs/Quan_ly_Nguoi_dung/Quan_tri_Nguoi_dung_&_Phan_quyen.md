# Use Case: Quản trị Người dùng & Phân quyền

**Description:** Quản lý tài khoản người dùng và phân quyền cho sinh viên/admin.

**Precondition:** Quản trị viên đã đăng nhập hệ thống với quyền Admin.

**Postcondition:** Tài khoản mới được tạo thành công trong hệ thống.

## Actors
- **Quản trị viên**

## Data Entities
- **Tài khoản người dùng**

## Flows
### ALT: Lỗi trùng tên tài khoản
1. Quản trị viên nhập trùng username. 2. Hệ thống hiển thị thông báo lỗi 'Tài khoản đã tồn tại'. 3. Quản trị viên nhập lại.

### MAIN: MAIN
1. Quản trị viên truy cập vào module quản lý người dùng. 2. Chọn chức năng tạo mới tài khoản. 3. Hệ thống hiển thị form nhập: Username, Tên, Mã số sinh viên, Vai trò (Sinh viên/Admin). 4. Quản trị viên nhập thông tin. 5. Hệ thống kiểm tra tính hợp lệ và lưu vào database. 6. Hệ thống hiển thị thông báo thành công.

## Business Rules
- Admin có quyền tạo, sửa, vô hiệu hóa tài khoản.
- Mật khẩu tối thiểu 8 ký tự, bao gồm chữ và số.
- Username phải là duy nhất.

