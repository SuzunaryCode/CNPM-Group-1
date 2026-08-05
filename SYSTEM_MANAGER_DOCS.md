# Tài liệu Hướng dẫn Hệ thống Quản trị & Phân quyền (System Manager & RBAC)

Mô-đun **System Manager** là một giao diện dành riêng cho quản trị viên cấp cao của hệ thống (có Global Role là `ADMIN`), hỗ trợ việc quản lý tài nguyên toàn cục, phát hành License Key và cấp phát quyền sử dụng cho khách hàng doanh nghiệp.

---

## 1. Tổng quan Kiến trúc Phân quyền 2 Tầng (2-Tier RBAC)

Hệ thống NovaChat AI áp dụng mô hình phân quyền 2 tầng độc lập để đảm bảo tính an toàn và tính bảo mật dữ liệu tuyệt đối:

```text
               ┌─────────────────────────────────────────┐
               │    Global System Role (Tầng Toàn Cục)   │
               └────────────────────┬────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────┐                          ┌──────────────────────┐
│  ADMIN / System Mgr  │                          │    USER / Business   │
│  (Dark Mode Bán Hàng)│                          │    (Doanh Nghiệp B)  │
└──────────────────────┘                          └──────────┬───────────┘
                                                             │
                                              ┌──────────────┴──────────────┐
                                              ▼                             ▼
                                   ┌────────────────────┐        ┌────────────────────┐
                                   │ Workspace Admin    │        │ Workspace Agent    │
                                   │ (Owner/Cấu hình)   │        │ (Nhân viên CSKH)   │
                                   └────────────────────┘        └────────────────────┘
```

1. **Tầng 1 - Global System Role (`User.role`):**
   - **`ADMIN` (System Manager):** Quản trị viên toàn hệ thống (Bên A). Độc quyền truy cập Admin Dashboard, tạo/thu hồi License Key, toggle trạng thái người dùng, quản lý tài khoản hỗ trợ toàn cục. Sử dụng giao diện **Premium Dark Mode**.
   - **`STAFF` (System Staff):** Trợ lý hỗ trợ kỹ thuật toàn cục của Bên A (chế độ xem/hỗ trợ toàn hệ thống).
   - **`USER` (Business Account):** Người dùng/Doanh nghiệp sử dụng dịch vụ (Bên B).

2. **Tầng 2 - Workspace Role (`WorkspaceMember.role`):**
   - **`admin` (Workspace Admin):** Chủ sở hữu hoặc quản trị viên của một Workspace cụ thể. Có toàn quyền cấu hình Bot AI, nạp/xóa tri thức (Knowledge Base), thiết lập Khóa Domain, quản lý và mời thành viên.
   - **`agent` (Workspace Staff / CSKH Agent):** Nhân viên tư vấn chăm sóc khách hàng của Doanh nghiệp. Chỉ có quyền truy cập tab **Hộp thoại (Omnibox)** để tiếp quản chat 1-1 với khách hàng khi AI chuyển giao (Human Takeover) và đóng hội thoại (`resolve`). Không có quyền sửa cấu hình bot hay dữ liệu tri thức.

---

## 2. Các chức năng của System Manager (Admin Dashboard)

### 2.1 Tổng quan (Dashboard Overview)
Giao diện cung cấp các thẻ thống kê trực quan theo thời gian thực:
- **Tổng Licenses**: Toàn bộ số lượng Key đã từng được tạo.
- **Đang kích hoạt (Active)**: Các Key đang được sử dụng và chưa hết hạn.
- **Đã hết hạn (Expired)**: Các Key đã vượt quá thời hạn sử dụng (`expires_at`).
- **Đã cấp phát (Assigned)**: Các Key đã được giao cho khách hàng cụ thể.

### 2.2 Quản lý Khách hàng (Customers)
- Tìm kiếm nhanh khách hàng theo `email`, `full_name` hoặc `company_name`.
- Chỉnh sửa trực tiếp tên công ty của từng doanh nghiệp.
- Nút tác vụ một chạm để chuyển đổi gói dịch vụ giữa **FREE** và **PRO**.

### 2.3 Quản lý License Key (Licenses)
- **Phát hành Key**: Tạo hàng loạt mã kích hoạt dạng `NOVA-XXXX-XXXX-XXXX-XXXX` kèm thời hạn.
- **Cấp phát & Vô hiệu hóa (Assign / Revoke)**: Gán Key cho Customer ID cụ thể hoặc thu hồi Key chưa dùng nếu cần.

---

## 3. Danh sách 3 Tài khoản Demo mẫu

Hệ thống đã tự động cài đặt sẵn 3 tài khoản đại diện cho 3 cấp vai trò:

1. **System Manager:** `system_manager@novachat.vn` / `manager123` (Global Role: `ADMIN`).
2. **Business Admin:** `business_admin@novachat.vn` / `admin123` (Global Role: `USER`, Workspace Role: `admin`).
3. **Business Staff (CSKH Agent):** `business_staff@novachat.vn` / `staff123` (Global Role: `USER`, Workspace Role: `agent`).
