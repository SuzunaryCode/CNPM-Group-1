# 6. User Stories và Tiêu chí Nghiệm thu (Acceptance Criteria)

## 1. Bản quyền & Thương mại hóa (Monetization & Licensing)

**Là System Manager**, tôi muốn sinh mã License Key và quản lý tài khoản Doanh nghiệp để bán gói PRO.
- Sinh key ngẫu nhiên CSPRNG định dạng `NOVA-XXXX-XXXX-XXXX-XXXX` kèm thời hạn.
- Cấp phát key cho Doanh nghiệp hoặc thu hồi key chưa sử dụng.
- Quản lý danh sách khách hàng và toggle gói FREE/PRO.
- Sở hữu giao diện **Premium Dark Mode** độc quyền.

**Là Doanh nghiệp Admin**, tôi muốn kích hoạt mã PRO để không bị giới hạn tính năng.
- Nhập mã Key trên trang Landing Page nâng cấp PRO (có QR Code hỗ trợ).
- Kích hoạt xong, hệ thống tự động đổi sang giao diện **Premium Light Glassmorphic Mode**, ẩn toàn bộ quảng cáo và mở khóa các tab bị khóa mờ mà không cần F5.

---

## 2. Phân quyền 2 Tầng (2-Tier RBAC)

**Là Doanh nghiệp Admin**, tôi muốn mời Nhân viên CSKH (Agent) vào Workspace để hỗ trợ tư vấn.
- Mời thành viên theo Email với vai trò `agent`.
- Phân định rạch ròi: Nhân viên CSKH chỉ được truy cập tab **Hộp thoại (Omnibox)** để chat với khách, bị chặn khỏi các cài đặt Bot AI, nạp tri thức và quản trị Workspace.

**Là Nhân viên CSKH (Business Staff / Agent)**, tôi muốn tiếp quản cuộc chat khi AI không trả lời được.
- Đăng nhập hệ thống được hướng trực tiếp tới tab **Hộp thoại (Omnibox)**.
- Đọc lại toàn bộ lịch sử trò chuyện cũ của AI với khách hàng.
- Thực hiện takeover độc quyền (khóa chống tranh chấp giữa 2 nhân viên) và bấm **Hoàn tất (Resolve)** để đóng ca.

---

## 3. Quản lý Tri thức & Cấu hình Bot (Knowledge Base & Bot Config)

**Là Doanh nghiệp Admin**, tôi muốn nạp tài liệu tiếng Việt có dấu và cấu hình tính cách cho Bot AI.
- Nạp file PDF/TXT/DOCX tối đa 50 MB hoặc nhập văn bản trực tiếp.
- Cấu hình **System Prompt** tiếng Việt có dấu chuẩn.
- Cấu hình danh sách tên miền được phép nhúng widget (**Allowed Domains**).

---

## 4. Hỏi đáp RAG & Trích dẫn (RAG Chat & Citations)

**Là Khách mua hàng (Customer)**, tôi muốn nhận được câu trả lời chính xác từ AI có nguồn trích dẫn.
- Khung chat stream câu trả lời theo thời gian thực (SSE).
- Hiển thị nguồn trích dẫn minh bạch (tên file, trang, preview).
- Nếu AI không có thông tin, AI tự động từ chối bịa đặt và hỗ trợ nút bấm **Gặp nhân viên hỗ trợ**.
