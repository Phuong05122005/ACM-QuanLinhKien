# Use Case: Xác thực nhận Kit

**Description:** Sinh viên quét mã QR tại tủ chứa để xác nhận nhận Kit đã đăng ký.

**Precondition:** User is logged in, has a confirmed LoanRecord with status 'Approved' or 'Ready to Pick-up'.

**Postcondition:** LoanRecord status is 'Borrowed', Kit status is 'In Use'.

## Actors
- **Sinh viên**

## Data Entities
- **QR_Code**
- **Kit**
- **LoanRecord**

## Flows
### EXCEPTION: Invalid QR Code
1. Sinh viên quét mã QR không khớp với bất kỳ LoanRecord nào đang chờ nhận.
2. Hệ thống hiển thị thông báo lỗi "Mã QR không hợp lệ hoặc không có đơn mượn tương ứng".
3. Sinh viên thử lại hoặc liên hệ quản trị viên.

### MAIN: Main Flow
1. Sinh viên mở ứng dụng và chọn tính năng "Xác thực nhận Kit".
2. Hệ thống hiển thị giao diện quét mã QR.
3. Sinh viên quét mã QR trên tủ chứa Kit.
4. Hệ thống kiểm tra mã QR đối chiếu với LoanRecord tương ứng của sinh viên.
5. Nếu hợp lệ, hệ thống cập nhật trạng thái LoanRecord thành "Đang mượn" và lưu thời gian thực.
6. Hệ thống cập nhật trạng thái Kit thành "Đang sử dụng".
7. Hệ thống thông báo xác thực thành công cho sinh viên.

## Business Rules
- Loan status must be 'Approved' or 'Ready to Pick-up' to be valid for pickup.
- QR code must match the assigned Kit and the current User's active LoanRecord.

