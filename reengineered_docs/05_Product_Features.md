# 5. Tính năng sản phẩm

Trạng thái tính năng hiện tại.

| Nhóm | Tính năng hiện có | Trạng thái/giới hạn |
|---|---|---|
| Auth | Email/password, JWT, Google OAuth | Hoàn thiện trong code; Google cần credentials |
| Workspace | Tạo/xóa, owner, membership Admin/Agent | Hoàn thiện luồng cơ bản |
| Invitation | Tạo/list/accept/delete member | Có link; chưa gửi email |
| Knowledge ingestion | PDF/TXT/DOCX/text, 50 MB, chunk 1000/200 | Xử lý đồng bộ; chưa OCR/worker |
| Knowledge management | Summary, preview, delete, quick edit text, replace duplicate | Hoàn thiện luồng cơ bản |
| Bot config | System prompt, domain, token, Test Bot | Hoàn thiện |
| RAG | Top-K 1–5, distance threshold, history 10, injection patterns | Có; threshold cần tuning dữ liệu thật |
| LLM | Ollama/Groq/Gemini thường và streaming, fallback tự động | Cloud provider cần API key và gửi context ra ngoài |
| Citations | filename, chunk, page, distance, preview | API và widget đã hiển thị |
| Widget | UMD, SSE, LocalStorage, WebSocket/poll | Hoàn thiện MVP |
| Widget customizer | Màu, tên, greeting, avatar URL, trái/phải, preview | Hoàn thiện; Khóa mờ nếu là gói FREE |
| Human Handoff | Request, waiting, takeover, reply, resolve | Hoàn thiện MVP |
| Concurrency | Redis lock + conditional SQL; local lock fallback | Cross-instance cần Redis hoạt động |
| Auto-responder | Tin hệ thống sau 60 giây | Có timer + poll check; chưa có durable job queue |
| Omnibox | Danh sách/lịch sử, realtime refresh, âm thanh/notification | Chưa Web Push nền |
| Analytics | Tổng session/message, trạng thái, sender | Hoàn thiện; Khóa mờ hoàn toàn nếu là gói FREE |
| Account settings | Profile và đổi mật khẩu | Có; chưa quản trị user nâng cao |
| Operations | Health, metrics, JSON log, rate limit | Rate limit in-memory, metrics chưa được bảo vệ trong app |
| Monetization | Cấp/quản lý License Key, nâng cấp PRO, quảng cáo giả lập | Hoàn thiện; Tự động cập nhật giao diện (PRO Light vs FREE Light vs Admin Dark) |
| Delivery | Alembic baseline, Docker Compose, Render blueprint, CI | Chưa có production environment đã xác nhận |

## Tính năng chưa có

- OCR cho PDF scan và xử lý bảng/hình phức tạp.
- Queue/background worker cho ingestion và handoff timeout.
- Email invitation, password reset và xác minh email.
- Quản lý role/disable user/ownership transfer đầy đủ.
- Web Push bằng Service Worker/VAPID.
- Upload/crop avatar và asset storage.
- Billing, quota, audit log, export báo cáo.
- OpenAI provider; code hiện hỗ trợ Ollama, Groq và Gemini.
