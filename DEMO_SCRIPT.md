# DEMO_SCRIPT.md — Kịch bản Live Demo hệ thống NovaChat AI (8 phút)

Tài liệu này cung cấp kịch bản kiểm thử và trình chiếu live demo chính thức cho buổi bảo vệ đồ án. Hệ thống đã được tích hợp sẵn **3 tài khoản Demo mẫu** cùng các dữ liệu thử nghiệm trong cơ sở dữ liệu.

---

## 1. Chuẩn bị 3 Tài khoản Demo mẫu

Hệ thống đã tự động khởi tạo sẵn 3 tài khoản đại diện cho đầy đủ 2 tầng phân quyền (Global Roles & Workspace Roles):

| Vai trò Demo | Email | Mật khẩu | Nhiệm vụ chính trong Demo |
| :--- | :--- | :--- | :--- |
| **1. System Manager** | `system_manager@novachat.vn` | `manager123` | Demo giao diện **Premium Dark Mode**, tạo License Key, quản lý danh sách Doanh nghiệp và cấp phát quyền. |
| **2. Business Admin** | `business_admin@novachat.vn` | `admin123` | Demo giao diện **Premium Light Mode**, Cấu hình Bot AI (tiếng Việt chuẩn), Nạp Tri thức, Khóa Domain nhúng và Mời nhân viên. |
| **3. Business Staff** | `business_staff@novachat.vn` | `staff123` | Demo vai trò **Nhân viên CSKH (Agent)** tiếp quản cuộc chat trực tiếp với khách hàng trên tab **Hộp thoại (Omnibox)**. |

---

## 2. Kịch bản Demo chi tiết (8 phút)

### Bước 1: Quản trị hệ thống & Cấp bản quyền (System Manager - 2 phút)
1. Đăng nhập tài khoản **System Manager** (`system_manager@novachat.vn` / `manager123`).
2. Trình bày điểm đặc trưng: Giao diện **Premium Dark Mode** độc quyền danh cho Quản trị viên cấp cao.
3. Truy cập tab **Quản lý Licenses** -> Nhấn "Phát hành Key mới" -> Sinh ra mã `NOVA-XXXX-XXXX-XXXX-XXXX`.
4. Truy cập tab **Khách hàng** -> Đổi trạng thái hoặc cấp phát mã Key cho `business_admin@novachat.vn`.

---

### Bước 2: Doanh nghiệp Cấu hình Bot & Kích hoạt PRO (Business Admin - 3 phút)
1. Đăng nhập tài khoản **Business Admin** (`business_admin@novachat.vn` / `admin123`).
2. Trình bày điểm đặc trưng: Giao diện **Premium Light Glassmorphic Mode** sang trọng (Mesh Gradient, viền chàm mờ, không quảng cáo).
3. **Cấu hình Bot AI:** Nhập câu lệnh **System Prompt** tiếng Việt chuẩn có dấu (ví dụ: *"Bạn là tư vấn viên của Doanh nghiệp A. Trả lời lịch sự dựa trên tài liệu..."*).
4. **Nạp Tri thức:** Upload file tài liệu hoặc nhập văn bản thông tin chính sách/sản phẩm vào mục **Quản lý Tri thức**.
5. **Khóa Domain (Allowed Domains):** Nhập danh sách tên miền được phép nhúng widget (ví dụ: `myshop.com`).
6. **Mời nhân viên:** Truy cập mục Quản lý thành viên, gửi lời mời cho `business_staff@novachat.vn` với vai trò **Agent** (Nhân viên tư vấn).

---

### Bước 3: Trải nghiệm Widget nhúng & Tự động phản hồi AI (2 phút)
1. Truy cập trang web nhúng mã Widget (hoặc mở preview Widget trên Dashboard).
2. Thấy bong bóng chat hiển thị với biểu tượng **số 1 chưa đọc nhấp sinh động**.
3. **Câu hỏi 1 (Trong tài liệu):** Khách hỏi *"Thời gian bảo hành sản phẩm là bao lâu?"*
   * *Kết quả:* AI phản hồi chính xác tiếng Việt có dấu và hiển thị **Nguồn trích dẫn (Citation)** đầy đủ.
4. **Câu hỏi 2 (Ngoài tài liệu - Chống bịa đặt):** Khách hỏi *"Giá vàng hôm nay bao nhiêu?"*
   * *Kết quả:* AI trả lời *"Tôi không có thông tin này trong tài liệu..."* và gợi ý bấm nút **Gặp nhân viên hỗ trợ**.

---

### Bước 4: Nhân viên CSKH tiếp quản cuộc chat - Human Takeover (Business Staff - 1 phút)
1. Trên Widget, khách hàng bấm nút **"Gặp nhân viên hỗ trợ"**.
2. Đăng nhập tài khoản **Business Staff** (`business_staff@novachat.vn` / `staff123`) trên một cửa sổ trình duyệt khác.
3. Tài khoản Nhân viên tự động mở ngay tab **Hộp thoại (Omnibox)** (không bị nhầm vào Admin Dashboard).
4. Thấy cuộc trò chuyện đang ở hàng đợi -> Nhấp chọn **Tiếp quản** -> Đọc lịch sử AI chat trước đó -> Gõ câu trả lời trực tiếp cho khách hàng.
5. Giải quyết xong vấn đề -> Nhấn nút **Hoàn tất (Resolve)** để kết thúc hội thoại.

---

## 3. Xử lý sự cố nhanh khi Live Demo

* **Nếu Widget không hiển thị:** Kiểm tra xem trang host có bị cấm Domain hay không, hoặc mở DevTools Console kiểm tra `allowed_domains`.
* **Nếu phản hồi AI chậm:** Render Free có thể bị sleep sau 15 phút không dùng. Đã cấu hình fallback tự động `auto` sang Groq/Gemini để luôn đảm bảo tốc độ phản hồi tính bằng millisecond.
