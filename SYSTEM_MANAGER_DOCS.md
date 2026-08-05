# Tài liệu Hướng dẫn Hệ thống Quản trị (System Manager)

Mô-đun **System Manager** là một giao diện dành riêng cho quản trị viên hệ thống (có Role là `ADMIN`), hỗ trợ việc quản lý tài nguyên, phát hành License Key và cấp phát quyền sử dụng cho khách hàng doanh nghiệp.

## 1. Tổng quan (Dashboard)
Giao diện cung cấp các thẻ thống kê trực quan theo thời gian thực:
- **Tổng Licenses**: Toàn bộ số lượng Key đã từng được tạo.
- **Đang kích hoạt (Active)**: Các Key đang được sử dụng và chưa hết hạn.
- **Đã hết hạn (Expired)**: Các Key đã vượt quá thời hạn sử dụng (`expires_at`).
- **Đã cấp phát (Assigned)**: Các Key đã được giao cho khách hàng (Customer) cụ thể thông qua tính năng Cấp phát.
- **Tổng khách hàng**: Tổng số lượng user không phải là STAFF.

## 2. Quản lý Khách hàng (Customers)
Tab này liệt kê toàn bộ danh sách người dùng trên hệ thống:
- Cung cấp tính năng **Tìm kiếm** theo `email`, `full_name` hoặc `company_name`.
- Cho phép chỉnh sửa trực tiếp (inline-edit) **Tên công ty** (`company_name`) của từng khách hàng.
- Nút tác vụ nhanh để bật/tắt (Toggle) gói dịch vụ giữa **FREE** và **PRO**.

## 3. Quản lý License Key (Licenses)
Nơi phát hành và kiểm soát toàn bộ mã kích hoạt:
- **Phát hành Key**: Quản trị viên có thể tạo một lúc nhiều Key (Số lượng), và có thể chỉ định **thời hạn sử dụng** (ví dụ: Key có hạn trong 30, 90 ngày hoặc vĩnh viễn).
- **Cấp phát Key (Assign)**: Nếu một License Key vẫn đang ở trạng thái `AVAILABLE`, quản trị viên có thể bấm "Cấp phát" và nhập ID của Khách hàng (Customer ID). Key đó sẽ được đánh dấu là của khách hàng đó trước khi họ thực sự kích hoạt.
- **Vô hiệu hóa (Revoke)**: Hủy bỏ một License Key chưa sử dụng nếu nghi ngờ bị lộ hoặc cấp sai.
- **Trạng thái tự động**: Hệ thống kiểm tra `expires_at` để tự động đổi trạng thái thành `EXPIRED` nếu quá hạn.

## 4. Quản lý Tài khoản Nội bộ (Staff)
- Cho phép quản trị viên cấp cao tạo ra các tài khoản với vai trò `STAFF` cho nhân sự hỗ trợ hệ thống.
- Các tài khoản này sẽ tự động nhận các quyền tương đương STAFF (chủ yếu là view/hỗ trợ, không có full quyền như ADMIN).

## Hướng dẫn Tích hợp & Deploy (Dành cho Team Leader)
1. Trong phiên bản này, file cấu hình `.vercel` và `vercel.json` đã được **gỡ bỏ** khỏi mã nguồn để ngăn tự động deploy vào dự án cũ.
2. Để deploy ứng dụng Frontend lên một tài khoản Vercel khác:
   - Truy cập trang chủ Vercel, chọn **Import Project**.
   - Cấp quyền truy cập vào Repo `CNPM-Group-1` cho tài khoản Vercel mới.
   - Khi chọn Framework, Vercel thường tự nhận diện là **Vite** (nhờ có file `vite.config.ts`).
   - Sửa root directory thành `/frontend` (hoặc để mặc định nếu build script của bạn trỏ đúng).
   - Thiết lập các biến môi trường cần thiết (như `VITE_API_URL` trỏ tới link Backend mới của nhóm).
3. Đảm bảo chạy Migration cho Backend trước khi khởi chạy để cập nhật cấu trúc cơ sở dữ liệu (các trường `company_name`, `expires_at`,...).

---
*(Tài liệu này được tự động tạo kèm bản cập nhật System Manager)*
