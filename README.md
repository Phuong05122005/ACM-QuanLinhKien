# 📦 ACM - Hệ thống Quản lý Linh kiện & Thiết bị

> [!WARNING]
> **THÔNG BÁO BẢN QUYỀN & QUYỀN SỞ HỮU TRÍ TUỆ (COPYRIGHT NOTICE)**
> Bản quyền © 2026 thuộc về **Phuong05122005** và **minhanhhhhhhh** (All Rights Reserved).
> 
> Toàn bộ tài liệu, thiết kế, cấu trúc hệ thống và mã nguồn trong tài nguyên dự án này (Smart-rental) là tài sản trí tuệ độc quyền của tác giả Phuong05122005, minhanhhhhhhh.
> 
> - 🚫 **Nghiêm cấm**: Trích xuất, sao chép, sửa đổi, phân phối hoặc tái sử dụng thương mại mà không có sự đồng ý bằng văn bản của tác giả.
> - 🔒 **Sử dụng**: Dự án này được bảo hộ theo luật bản quyền và các công ước quốc tế về sở hữu trí tuệ.

<div align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-8-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

<br />

**ACM (University Component Management)** là hệ thống quản lý linh kiện và thiết bị toàn diện dành cho trường đại học/phòng lab. Hệ thống giúp theo dõi, kiểm kê, cấp phát và thu hồi linh kiện một cách thông minh, nhanh chóng và chính xác.

## ✨ Tính năng nổi bật

- 🔐 **Xác thực & Phân quyền**: Quản lý truy cập an toàn với nhiều vai trò (Admin, Sinh viên).
- 📦 **Quản lý Kho & Thiết bị**: Theo dõi chi tiết tình trạng, số lượng, lịch sử thiết bị.
- 🔄 **Quy trình Mượn/Trả**: Tự động hóa quy trình mượn, trả linh kiện, quản lý các đơn mượn.
- 📱 **Tích hợp Mã QR**: Quét mã QR để định danh và tra cứu thông tin thiết bị tức thì.
- ⚖️ **Hệ thống Khiếu nại**: Giải quyết các tranh chấp, khiếu nại về số lượng/tình trạng linh kiện.
- 📊 **Dashboard & Báo cáo**: Tổng hợp dữ liệu trực quan về tình hình sử dụng kho.

## 🚀 Công nghệ sử dụng

- **Frontend & Backend**: Next.js 16 (App Router), React 19.
- **Giao diện**: Tailwind CSS v4, Lucide Icons.
- **Database**: PostgreSQL tích hợp cùng Prisma ORM v8.
- **Testing**: Playwright (E2E), Vitest.

## 🛠️ Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) (phiên bản 20 trở lên)
- [PostgreSQL](https://www.postgresql.org/) (đã được cài đặt hoặc chạy qua Docker)

### 2. Cài đặt dự án

Clone repository về máy:
```bash
git clone https://github.com/Phuong05122005/ACM-QuanLinhKien.git
cd ACM-QuanLinhKien
```

Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Điền các thông tin kết nối tới cơ sở dữ liệu PostgreSQL của bạn vào biến `DATABASE_URL`. Bạn cũng có thể dùng file `docker-compose.yml` có sẵn để chạy DB qua docker:
```bash
docker-compose up -d
```

### 4. Khởi tạo Database (Prisma)

Đồng bộ schema với database (hoặc chạy migration nếu có):
```bash
npx prisma db push
```

### 5. Chạy ứng dụng

Khởi động server ở môi trường development:
```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để trải nghiệm.

## 👥 Tác giả

Dự án được phát triển và đóng góp bởi:

- 👤 **[Phuong05122005](https://github.com/Phuong05122005)**
- 👤 **[minhanhhhhhhh](https://github.com/minhanhhhhhhh)**

---
*Cảm ơn bạn đã quan tâm đến dự án!* 💖
