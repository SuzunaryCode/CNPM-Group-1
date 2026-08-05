# 3. Chân dung người dùng (Personas)

## Persona 1: System Manager (Admin toàn cục - Bên A)

**Nguyễn Tiến Anh**, 35 tuổi, đại diện đơn vị phát hành và vận hành hệ thống NovaChat AI.

- **Mục tiêu:** Quản lý toàn bộ khách hàng doanh nghiệp, phát hành License Key bản quyền, kiểm soát hạ tầng và tài nguyên hệ thống.
- **Nỗi đau:** Khách hàng sử dụng quá hạn mức mà không trả phí, khó theo dõi danh sách key bản quyền và tài khoản doanh nghiệp.
- **Luồng trong sản phẩm:** Đăng nhập giao diện **Premium Dark Mode**, quản lý số lượng License Key (sinh key 30, 90 ngày, vĩnh viễn), cấp phát key cho khách hàng, toggle trạng thái FREE/PRO.
- **Quyền hạn:** Global Role `ADMIN` — có toàn quyền quản trị hệ thống cao nhất.

---

## Persona 2: Doanh nghiệp Admin (Founder/Owner - Bên B)

**David Trần**, 38 tuổi, chủ sở hữu doanh nghiệp SME E-commerce.

- **Mục tiêu:** Tự động hóa khâu CSKH, tùy biến bot theo nhận diện thương hiệu, bảo mật tên miền nhúng và nâng cấp gói PRO để sử dụng không giới hạn.
- **Nỗi đau:** Lo sợ AI bịa đặt thông tin chính sách, ngại cấu hình kỹ thuật phức tạp, bị giới hạn tính năng ở gói FREE.
- **Luồng trong sản phẩm:** Tạo workspace, nạp tri thức tiếng Việt có dấu, cấu hình System Prompt & thiết lập Khóa Domain, nhúng mã Widget, mua key nâng cấp PRO (giao diện **Premium Light Glassmorphic Mode**) và gửi lời mời nhân viên CSKH.
- **Quyền hạn:** Global Role `USER`, Workspace Role `admin` (Owner) — có toàn quyền cấu hình trong phạm vi Workspace của mình.

---

## Persona 3: Nhân viên CSKH (Business Staff / Workspace Agent - Bên B)

**Sarah Nguyễn**, 26 tuổi, nhân viên tư vấn và chăm sóc khách hàng của doanh nghiệp.

- **Mục tiêu:** Tiếp quản các cuộc hội thoại mà AI không giải quyết được (`waiting_human`), đọc lại toàn bộ lịch sử trao đổi của khách với AI để tư vấn trực tiếp 1-1 và đóng cuộc hội thoại khi hoàn tất.
- **Nỗi đau:** Bị giao diện quá nhiều nút cấu hình làm phân tâm, bỏ lỡ cuộc gọi của khách khi bận ca.
- **Luồng trong sản phẩm:** Đăng nhập tài khoản được Admin mời, tự động mở ngay tab **Hộp thoại (Omnibox)**, nhận âm thanh thông báo khi có khách yêu cầu, nhấp **Tiếp quản**, chat tư vấn và bấm **Hoàn tất (Resolve)**.
- **Quyền hạn:** Global Role `USER`, Workspace Role `agent` — chỉ được xem và xử lý các cuộc hội thoại chat, bị ẩn/khóa các mục cấu hình Bot, nạp tri thức và cài đặt quản trị.

---

## Persona 4: Khách mua hàng trên Website (Customer)

**Michael Lê**, 22–45 tuổi, người truy cập trang web của doanh nghiệp.

- **Mục tiêu:** Đặt câu hỏi và nhận câu trả lời chính xác, tức thì mà không cần tạo tài khoản hay đăng nhập.
- **Nỗi đau:** Phải chờ đợi lâu, trả lời không có căn cứ hoặc không cho kết nối với nhân viên thật.
- **Luồng trong sản phẩm:** Mở bong bóng chat Widget (có biểu tượng **số 1 chưa đọc nhấp nháy**), gõ câu hỏi nhận stream câu trả lời kèm nguồn trích dẫn (citation), nhấp nút **Gặp nhân viên hỗ trợ** khi cần trao đổi trực tiếp với người thật.
