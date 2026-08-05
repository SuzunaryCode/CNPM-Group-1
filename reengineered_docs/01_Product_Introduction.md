# 1. Giới thiệu sản phẩm NovaChat AI

Ngày cập nhật: **06/08/2026**.

## NovaChat AI là gì?

NovaChat AI là nền tảng chatbot RAG tiên tiến dành cho doanh nghiệp SME. Doanh nghiệp dễ dàng tạo workspace, nạp tài liệu riêng (tiếng Việt có dấu chuẩn) và nhúng widget vào bất kỳ website nào (dán 1 thẻ `<script>` duy nhất, không cần cấu hình phức tạp). AI tìm kiếm context trong kho tri thức (lưu trong Postgres), sử dụng Ollama/Groq/Gemini để tự động phản hồi khách hàng và tự động chuyển cuộc hội thoại cho **Nhân viên CSKH (Agent)** khi tri thức không đủ hoặc khi khách hàng bấm chọn "Gặp nhân viên".

Sản phẩm áp dụng mô hình kinh doanh **Freemium**:
- **Gói FREE (Doanh nghiệp FREE):** Giới hạn 50 tin nhắn/tháng, dán nhãn watermark "Powered by NovaChat", chèn các banner quảng cáo giả lập (Canva Pro/Hosting), bị phủ cờ khóa mờ (glassmorphic lock screen) ở các tính năng cao cấp.
- **Gói PRO (Doanh nghiệp PRO):** Không giới hạn tin nhắn, gỡ bỏ toàn bộ quảng cáo và watermark, mở khóa tính năng Khóa Domain, Tùy chỉnh giao diện Widget và Thống kê & Báo cáo nâng cao. Sở hữu giao diện **Premium Light Glassmorphic Mode** sang trọng.
- **System Manager (Bên A):** Sở hữu giao diện **Premium Dark Mode** độc quyền để quản lý bản quyền, phát hành License Key và cấp phát gói dịch vụ.

## Luồng cốt lõi hiện đã có

1. **Quản lý Bản quyền & Nâng cấp PRO (Monetization):** System Manager sinh mã License Key `NOVA-XXXX-XXXX-XXXX-XXXX`. Doanh nghiệp kích hoạt mã tại trang Landing Page nâng cấp PRO; hệ thống tự động cập nhật trạng thái giao diện và mở khóa tính năng tức thì (Reactive Refresh ngầm không cần F5).
2. **Nạp tri thức & Phân tích:** Admin tải PDF, TXT, DOCX hoặc nhập văn bản trực tiếp (hỗ trợ tiếng Việt có dấu chuẩn). Backend chia đoạn 600 ký tự, overlap 100, tạo Gemini embedding 768 chiều và lưu trực tiếp trong Postgres.
3. **Hỏi đáp RAG & Trích dẫn (Citations):** Widget gửi câu hỏi bằng SSE. Backend kết hợp semantic search trên Postgres với BM25 local qua RRF, chống hallucination và trả về câu trả lời kèm thông tin trích dẫn nguồn (tên file, trang, preview).
4. **Tiếp quản hội thoại (Human Takeover) & Phân quyền 2 Tầng:** 
   - **Tầng 1 (Toàn hệ thống):** `ADMIN` (System Manager) và `STAFF` (Trợ lý hệ thống của Bên A).
   - **Tầng 2 (Workspace Doanh nghiệp):** `admin` (Chủ doanh nghiệp) và `agent` (Nhân viên CSKH của Bên B).
   - Khi có yêu cầu kết nối, Nhân viên CSKH (`agent`) đăng nhập hệ thống sẽ tự động truy cập tab **Hộp thoại (Omnibox)** để đọc toàn bộ lịch sử trò chuyện cũ và tư vấn trực tiếp 1-1 với khách hàng.
5. **Dán mã nhúng là chạy ngay:** Widget chạy dưới dạng **Shadow DOM** cách ly CSS với trang host, serve cùng origin với dashboard, chỉ cần 1 thẻ `<script>` duy nhất.

---

## Nguyên tắc sản phẩm

- **Tách biệt theo workspace (Multi-tenancy):** Mọi truy vấn SQL và embedding đều lọc theo `workspace_id`.
- **Phân định rạch ròi 2 tầng RBAC:** Tách biệt tuyệt đối giữa Quản trị hệ thống (Bên A) và Nhân viên tư vấn CSKH (Bên B).
- **Trải nghiệm cao cấp (Premium UI/UX):** Phân tầng giao diện trực quan giữa Dark Mode (Admin hệ thống), Premium Light Glassmorphism (Doanh nghiệp PRO) và Basic Light (Doanh nghiệp FREE).
- **Plug and Play:** Nhúng mã script đơn giản, hoạt động tức thì trên mọi nền tảng website (HTML, React, Next.js).
