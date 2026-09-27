# Use Case: Giải quyết khiếu nại mượn/trả

**Description:** Xử lý các khiếu nại của sinh viên đối với kết quả kiểm kê linh kiện.

**Precondition:** Đã tồn tại đơn mượn trả có kết quả lỗi được AI gắn cờ và sinh viên đã gửi khiếu nại.

**Postcondition:** Khiếu nại được đóng, trạng thái LoanRecord cập nhật, kết quả được ghi vào AuditLog.

## Actors
- **Sinh viên**
- **Quản trị viên**

## Data Entities
- **AuditLog**
- **DisputeRecord**
- **LoanRecord**

## Flows
### ALT: Thiếu bằng chứng
1. Admin nhận thấy bằng chứng không đủ rõ ràng để ra quyết định.
2. Admin chọn 'Yêu cầu thêm bằng chứng'.
3. Hệ thống gửi thông báo yêu cầu cho Sinh viên.
4. Sinh viên bổ sung bằng chứng và quy trình quay lại bước 1.

### MAIN
1. Sinh viên gửi khiếu nại qua hệ thống kèm bằng chứng (Ảnh/Video).
2. Hệ thống tạo DisputeRecord với trạng thái 'Pending'.
3. Admin truy cập mục 'Danh sách khiếu nại'.
4. Admin xem xét đối chiếu kết quả quét AI (nếu có) và bằng chứng của sinh viên.
5. Admin chọn 'Phê duyệt' hoặc 'Từ chối'.
6. Hệ thống cập nhật trạng thái LoanRecord (nếu Phê duyệt: ghi nhận lỗi AI/điều chỉnh trạng thái linh kiện).
7. Hệ thống thông báo kết quả cho Sinh viên.
8. Hệ thống ghi lại toàn bộ hành động vào AuditLog.

## Business Rules
- Mọi quyết định của Admin phải được ghi lại vào AuditLog với lý do cụ thể.
- Bằng chứng (ảnh/video) là bắt buộc.
- Khiếu nại phải được gửi trong vòng 24 giờ sau khi trả linh kiện.

