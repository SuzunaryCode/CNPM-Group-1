# 4. Kịch bản người dùng (User Scenarios)

## Scenario 1: Quản trị hệ thống & Cấp bản quyền (System Manager)

1. System Manager đăng nhập bằng tài khoản `ADMIN` (`system_manager@novachat.vn`).
2. Giao diện mở ra ở định dạng **Premium Dark Mode** độc quyền.
3. System Manager truy cập tab **Quản lý Licenses**, nhấn "Phát hành Key mới", chọn số lượng và thời hạn (30, 90 ngày hoặc vĩnh viễn).
4. Hệ thống sinh ra chuỗi mã ngẫu nhiên CSPRNG dạng `NOVA-XXXX-XXXX-XXXX-XXXX`.
5. System Manager chuyển sang tab **Khách hàng**, bấm "Cấp phát Key" cho ID của Doanh nghiệp.

---

## Scenario 2: Nâng cấp PRO & Tự động cập nhật giao diện (Business Admin)

1. Doanh nghiệp Admin ở gói FREE nhấp chọn nút nhấp nháy **Nâng cấp PRO 🚀** trên sidebar.
2. Màn hình Landing Page hiển thị bảng so sánh tính năng và mã QR liên hệ mua Key.
3. Doanh nghiệp nhập mã License Key được cấp vào ô xác thực và bấm "Kích hoạt".
4. Backend kiểm tra Key hợp lệ, chuyển `User.plan` thành `PRO` và đánh dấu Key đã dùng.
5. Hệ thống kích hoạt callback **Reactive Refresh**, tự động chuyển đổi giao diện sang **Premium Light Glassmorphic Mode**, loại bỏ toàn bộ banner quảng cáo và mở khóa ngay các tính năng bị khóa mờ mà không cần F5.

---

## Scenario 3: Onboarding & Cấu hình Bot AI (tiếng Việt chuẩn)

1. Doanh nghiệp Admin tạo Workspace mới.
2. Điền thông điệp chỉ dẫn tại ô **System Prompt (Tính cách Bot)** bằng tiếng Việt có dấu chuẩn.
3. Nạp tài liệu tri thức (PDF/TXT/DOCX hoặc text) vào mục **Quản lý Tri thức**. Tiến trình tự động chia đoạn và lưu embedding vào Postgres.
4. Cấu hình các tên miền được phép nhúng widget tại mục **Khóa Domain (Allowed Domains)** để bảo mật.

---

## Scenario 4: Nhúng Widget & Phản hồi AI tự động có Trích dẫn

1. Admin copy đoạn mã nhúng script 1 thẻ duy nhất dán vào trang web doanh nghiệp trước thẻ `</body>`.
2. Khách hàng truy cập website thấy bong bóng chat hiển thị với biểu tượng **số 1 chưa đọc nhấp nháy**.
3. Khách hàng gõ câu hỏi. Widget gửi request stream qua SSE.
4. Backend thực hiện RAG (truy hồi context + BM25 local), trả lời bằng tiếng Việt có dấu và đính kèm **Nguồn trích dẫn (Citation)** minh bạch bên dưới.

---

## Scenario 5: Khách hàng yêu cầu người thật & Nhân viên CSKH tiếp quản (Human Takeover)

1. Trên Widget, khách hàng nhấp nút **Gặp nhân viên hỗ trợ**.
2. Trạng thái cuộc hội thoại chuyển sang `waiting_human`.
3. Nhân viên CSKH (Business Staff - `agent`) đăng nhập tài khoản của mình. Hệ thống tự động mở ngay tab **Hộp thoại (Omnibox)**.
4. Nhân viên thấy thông báo cuộc gọi chờ, bấm **Tiếp quản** (hệ thống dùng Redis Distributed Lock ngăn 2 nhân viên tranh chấp).
5. Nhân viên xem lại toàn bộ lịch sử trò chuyện cũ của AI với khách hàng, gõ câu trả lời trực tiếp 1-1.
6. Xử lý xong, Nhân viên nhấn **Hoàn tất (Resolve)** để đóng cuộc hội thoại.

---

## Scenario 6: Mời Nhân viên CSKH vào Workspace

1. Admin truy cập mục Quản lý thành viên trong Workspace.
2. Nhập email của nhân viên CSKH, chọn vai trò `Agent` và tạo lời mời.
3. Hệ thống tạo Token lời mời bảo mật. Nhân viên đăng nhập/đăng ký bằng email tương ứng và chấp nhận lời mời để tham gia vào đội ngũ CSKH của Workspace.
