# Use Case: Đăng nhập

**Description:** Sinh viên hoặc Quản trị viên đăng nhập vào hệ thống bằng tài khoản được cấp.

**Precondition:** Hệ thống đang hoạt động và người dùng có tài khoản hợp lệ.

**Postcondition:** Người dùng được xác thực và phiên làm việc (session) được khởi tạo.

## Actors
- **Quản trị viên**
- **Sinh viên**

## Data Entities
- **Tài khoản người dùng**

## Flows
### ALT: Đăng nhập thất bại
1. Người dùng nhập sai Username hoặc Password.
2. Hệ thống kiểm tra số lần nhập sai.
3. Nếu số lần nhập sai < 5, hệ thống thông báo lỗi "Tên đăng nhập hoặc mật khẩu không chính xác".
4. Nếu số lần nhập sai đạt 5, hệ thống thông báo "Tài khoản tạm khóa trong 15 phút" và cập nhật trạng thái tài khoản.

### MAIN
1. Người dùng nhập Username và Password vào form đăng nhập. 
2. Hệ thống kiểm tra tính hợp lệ của định dạng dữ liệu (ví dụ: không để trống).
3. Hệ thống đối chiếu thông tin đăng nhập với cơ sở dữ liệu.
4. Nếu hợp lệ, hệ thống tạo session cho người dùng và chuyển hướng đến màn hình chính tương ứng (dashboard sinh viên hoặc dashboard admin).

## Business Rules
- Sau 5 lần nhập sai liên tiếp, tài khoản sẽ bị khóa tạm thời trong 15 phút.
- Username và Password là bắt buộc.

