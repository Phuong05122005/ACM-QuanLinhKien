# Use Case: Đăng ký mượn linh kiện

**Description:** Sinh viên đăng ký mượn Kit linh kiện và nhận mã QR để xác nhận.

**Precondition:** Sinh viên đã đăng nhập vào hệ thống.

**Postcondition:** Đơn mượn ở trạng thái "Chờ nhận" (Pending) được tạo và mã QR được sinh ra.

## Actors
- **Sinh viên**

## Data Entities
- **Đơn mượn**
- **Kit linh kiện**

## Flows
### ALT: Linh kiện hết hàng
1. Hệ thống phát hiện linh kiện yêu cầu không còn đủ số lượng.
2. Hệ thống hiển thị cảnh báo "Linh kiện [Tên linh kiện] tạm thời hết hàng".
3. Yêu cầu sinh viên điều chỉnh lại danh sách chọn hoặc số lượng.

### MAIN
1. Sinh viên chọn danh sách Kit linh kiện cần mượn từ danh mục khả dụng.
2. Sinh viên nhập hạn trả (Return Date).
3. Hệ thống kiểm tra số lượng linh kiện mượn (phải <= 5 loại) và kiểm tra hạn trả (từ 1-7 ngày).
4. Hệ thống kiểm tra tình trạng tồn kho của từng linh kiện.
5. Nếu hợp lệ, hệ thống tạo Đơn mượn với trạng thái "Chờ nhận" (Pending).
6. Hệ thống tạo mã QR duy nhất cho đơn mượn và hiển thị cho sinh viên.

## Business Rules
- Hạn trả phải nằm trong khoảng từ 1 đến 7 ngày kể từ ngày mượn.
- Sinh viên không được mượn quá 5 loại linh kiện cùng lúc.

