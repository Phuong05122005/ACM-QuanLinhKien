# Use Case: Quản trị Kết quả Kiểm kê AI

**Description:** Xem lịch sử quét AI và xác nhận kết quả kiểm kê.

**Precondition:** Quản trị viên đã đăng nhập hệ thống với quyền Admin, có kết quả quét AI chưa được xác nhận.

**Postcondition:** Kết quả kiểm kê được Admin xác nhận hoặc cập nhật, tồn kho được phản ánh chính xác.

## Actors
- **Quản trị viên**

## Data Entities
- **AuditLog**
- **AI_Scan_Result**

## Flows
### ALT: Không thay đổi kết quả
1. Admin không thực hiện thay đổi nào. 2. Admin chọn 'Đóng'. 3. Hệ thống giữ nguyên trạng thái cũ.

### MAIN: MAIN
1. Quản trị viên truy cập vào lịch sử kiểm kê. 2. Hệ thống hiển thị các kết quả quét gần đây, đặc biệt là các kết quả có gắn cờ 'Cần kiểm tra'. 3. Quản trị viên xem chi tiết hình ảnh và kết quả AI. 4. Quản trị viên xác nhận lại hoặc sửa trạng thái linh kiện (ví dụ: từ 'Bị hỏng' sang 'Bình thường'). 5. Hệ thống cập nhật kho và lưu lịch sử thay đổi vào AuditLog.

## Business Rules
- Mọi thay đổi của Admin lên kết quả AI phải được ghi lại vào AuditLog.
- Admin có quyền xác nhận lại kết quả AI (phân loại lại linh kiện).

