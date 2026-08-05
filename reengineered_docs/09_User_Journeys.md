# 9. Hành trình người dùng (User Journeys)

## 1. Hành trình 1: System Manager (Cấp bản quyền & Quản lý)

| Bước | Hành động | Phản hồi hệ thống | Giao diện |
|---|---|---|---|
| 1. Đăng nhập | Đăng nhập tài khoản `system_manager@novachat.vn` | Xác thực JWT và kiểm tra Role `ADMIN` | Chuyển sang **Premium Dark Mode** độc quyền |
| 2. Sinh Key | Vào tab **Quản lý Licenses** -> Nhấn "Phát hành Key mới" | Tạo ra dãy mã CSPRNG `NOVA-XXXX-XXXX-XXXX-XXXX` | Hiển thị bảng danh sách Key với trạng thái `AVAILABLE` |
| 3. Quản lý Doanh nghiệp | Vào tab **Khách hàng** | Xem danh sách Doanh nghiệp, đổi tên công ty hoặc nâng cấp plan thủ công | Cập nhật trực tiếp trên bảng dữ liệu |

---

## 2. Hành trình 2: Doanh nghiệp Admin (Onboarding, Nâng cấp PRO & Nhúng Widget)

| Bước | Hành động | Phản hồi hệ thống | Giao diện |
|---|---|---|---|
| 1. Tạo Workspace | Đăng ký/Đăng nhập -> Nhấn Tạo Workspace | Tạo workspace mới kèm System Prompt tiếng Việt chuẩn | Giao diện sáng cơ bản (gói FREE) có quảng cáo |
| 2. Nạp tri thức | Upload file PDF/TXT/DOCX trong tab **Quản lý Tri thức** | Tách chunk, tạo Gemini embedding và lưu vào Postgres | Bảng danh sách tài liệu hiển thị số chunk/preview |
| 3. Nâng cấp PRO | Bấm nút **Nâng cấp PRO 🚀** -> Nhập mã Key | Xác thực Key, chuyển plan thành `PRO`, gọi callback `onUserUpdated` | Tự động đổi sang **Premium Light Glassmorphic Mode**, ẩn quảng cáo, mở khóa tab mờ |
| 4. Nhúng Widget | Cấu hình Khóa Domain -> Copy mã script 1 thẻ | Khung chat độc lập Shadow DOM khởi chạy trên website khách | Bong bóng chat hiển thị với số 1 chưa đọc nhấp nháy |

---

## 3. Hành trình 3: Khách hàng & Nhân viên CSKH (Human Handoff Flow)

| Bước | Hành động Khách hàng (Customer) | Hành động Nhân viên CSKH (Business Staff) | Trạng thái Session |
|---|---|---|---|
| 1. Hỏi đáp AI | Gõ câu hỏi trên Widget nhúng | — | `bot_handling` (AI stream câu trả lời có citation) |
| 2. Yêu cầu hỗ trợ | Bấm nút **Gặp nhân viên hỗ trợ** | Omnibox phát âm thanh và nhận sự kiện realtime | `waiting_human` |
| 3. Tiếp quản | Thấy thông báo "Đang kết nối nhân viên..." | Đăng nhập tài khoản `agent`, tự động mở tab **Hộp thoại**, bấm **Tiếp quản** | `human_handling` (Redis Lock ngăn tranh chấp) |
| 4. Trò chuyện 1-1 | Nhận câu trả lời của nhân viên trên Widget | Đọc lịch sử AI chat trước đó và trả lời khách | `human_handling` (AI ngắt tự động trả lời) |
| 5. Hoàn tất | Thấy thông báo cuộc chat hoàn tất | Bấm nút **Hoàn tất (Resolve)** để đóng ca | `resolved` |
