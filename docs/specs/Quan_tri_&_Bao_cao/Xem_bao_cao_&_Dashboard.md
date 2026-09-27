# Use Case: Xem báo cáo & Dashboard

**Description:** Xem Dashboard thời gian thực và xuất báo cáo mượn trả.

**Precondition:** Quản trị viên đã đăng nhập hệ thống.

**Postcondition:** Báo cáo được hiển thị hoặc xuất ra thành công.

## Actors
- **Quản trị viên**

## Data Entities
- **KitComponent**
- **LoanRecord**

## Flows
### ALT: No Data Found
Không có dữ liệu thỏa mãn bộ lọc. Hệ thống hiển thị thông báo 'Không tìm thấy dữ liệu' và gợi ý điều chỉnh lại bộ lọc.

### MAIN: MAIN
Quản trị viên truy cập Dashboard quản trị. Hệ thống hiển thị các thông số thời gian thực: số lượng linh kiện đang cho mượn, cảnh báo linh kiện hỏng/thiếu, số lượng người dùng đang mượn. Quản trị viên chọn xem báo cáo chi tiết theo bộ lọc: thời gian, loại linh kiện, sinh viên. Hệ thống truy vấn cơ sở dữ liệu và hiển thị báo cáo dạng bảng và biểu đồ. Quản trị viên có thể chọn 'Xuất báo cáo' (PDF/Excel). Hệ thống xử lý yêu cầu và tải về file báo cáo.

## Business Rules
- Dữ liệu báo cáo phải được làm mới trong thời gian thực (tối đa 1 phút).
- Admin phải xác thực thành công.

