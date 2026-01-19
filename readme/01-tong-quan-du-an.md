# 📋 Tổng Quan Dự Án - Board Game Web Application

## 1. Giới Thiệu

**Tên dự án:** Board Game Web Application  
**Môn học:** Phát triển Ứng dụng Web  
**Công nghệ:** ReactJS (Frontend) + Express.js (Backend) + Supabase (Database)

### Mục tiêu
Xây dựng một ứng dụng web chơi game dạng bàn cờ (Board Game) với đầy đủ các tính năng:
- Nhiều loại game khác nhau
- Hệ thống người dùng và xã hội
- Quản trị viên quản lý hệ thống

---

## 2. Tính Năng Chính

### 2.1. Hệ Thống Game (7 Games)

| # | Game | Mô tả | Đặc điểm |
|---|------|-------|----------|
| 1 | **Caro hàng 5** | Cờ caro chuẩn, 5 quân liên tiếp thắng | Board 15×15, AI Computer |
| 2 | **Caro hàng 4** | Caro đơn giản, 4 quân liên tiếp thắng | Board 10×10, AI Computer |
| 3 | **Tic-tac-toe** | Cờ XO cổ điển | Board 3×3, AI Computer |
| 4 | **Rắn săn mồi** | Snake game cổ điển | Tốc độ tăng dần, tính điểm |
| 5 | **Ghép hàng 3** | Match-3 như Candy Crush | Combo scoring |
| 6 | **Cờ trí nhớ** | Lật bài tìm cặp giống nhau | Đếm lượt, thời gian |
| 7 | **Bảng vẽ tự do** | Canvas vẽ tự do | Chọn màu, brush size |

### 2.2. Điều Khiển 5 Nút

```
┌──────┬───────┬───────┬──────┬──────┐
│ LEFT │ RIGHT │ ENTER │ BACK │ HINT │
│  ←   │   →   │   ✓   │  ↩   │  ?   │
└──────┴───────┴───────┴──────┴──────┘
```

- **LEFT (←)**: Di chuyển trái / Chọn mục trước
- **RIGHT (→)**: Di chuyển phải / Chọn mục sau  
- **ENTER (✓)**: Xác nhận lựa chọn / Đánh quân cờ
- **BACK (↩)**: Quay lại / Thoát game
- **HINT (?)**: Hiển thị gợi ý / Hướng dẫn

### 2.3. Tính Năng Người Dùng

| Tính năng | Mô tả |
|-----------|-------|
| **Profile** | Xem và chỉnh sửa thông tin cá nhân |
| **Tìm kiếm** | Tìm người dùng khác trong hệ thống |
| **Kết bạn** | Gửi/nhận lời mời kết bạn, quản lý danh sách |
| **Tin nhắn** | Gửi tin nhắn cho bạn bè |
| **Thành tựu** | Mở khóa achievements khi đạt mốc |
| **Xếp hạng** | Xem ranking theo game, bạn bè, cá nhân |

### 2.4. Tính Năng Quản Trị

| Tính năng | Mô tả |
|-----------|-------|
| **Dashboard** | Tổng quan hệ thống |
| **Quản lý Users** | CRUD người dùng, phân quyền |
| **Thống kê** | Game hot, lượt chơi, tài khoản mới |
| **Quản lý Games** | Bật/tắt game, cấu hình kích thước |

---

## 3. Công Nghệ Sử Dụng

### 3.1. Frontend
- **Framework:** React 18 với Vite
- **Routing:** React Router v6
- **State:** React Context API
- **HTTP Client:** Axios
- **Styling:** CSS Variables (Dark/Light mode)

### 3.2. Backend  
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database ORM:** Knex.js
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT + Supabase Auth
- **API Docs:** Swagger/OpenAPI

### 3.3. Database
- **Provider:** Supabase
- **Type:** PostgreSQL
- **Features:** Real-time, Auth, Storage

---

## 4. Kiến Trúc MVC

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                     │
│                         ReactJS                           │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS + API Key
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Routes    │──│ Controllers │──│     Models      │  │
│  │  (routes/)  │  │(controllers)│  │   (models/)     │  │
│  └─────────────┘  └─────────────┘  └────────┬────────┘  │
│                                              │           │
└──────────────────────────────────────────────┼───────────┘
                                               │ Knex
                                               ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (Supabase)                      │
│                     PostgreSQL                            │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Bảo Mật

### 5.1. Authentication
- Đăng ký với validation (email, password strength)
- Đăng nhập với JWT token
- Token refresh mechanism
- Password hashing với bcrypt

### 5.2. Authorization
- Role-based access control (User, Admin)
- Protected routes
- API Key cho API-docs

### 5.3. Security Headers
- HTTPS required
- CORS configuration
- Helmet.js for security headers

---

## 6. Cấu Trúc Thư Mục

```
project/
├── readme/              # Tài liệu thiết kế
├── backend/             # Express.js API
│   ├── src/
│   │   ├── config/      # Cấu hình
│   │   ├── controllers/ # Controllers (C)
│   │   ├── models/      # Models (M)
│   │   ├── routes/      # Routes
│   │   ├── middleware/  # Middleware
│   │   └── validators/  # Input validation
│   ├── migrations/      # Knex migrations
│   └── seeds/           # Data seeding
├── frontend/            # ReactJS App
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── layouts/     # Layout components (V)
│   │   ├── context/     # React Context
│   │   ├── services/    # API services
│   │   └── styles/      # CSS files
│   └── public/
└── README.md
```

---

## 7. Dữ Liệu Demo

### Users (≥5 người dùng)
1. **admin** - Quản trị viên hệ thống
2. **player1** - Người chơi chuyên Caro, rank cao
3. **player2** - Người chơi đa dạng các game
4. **player3** - Người chơi mới, ít thành tựu
5. **player4** - Người chơi casual
6. **player5** - Người chơi competitive

### Sample Data
- 20+ game sessions
- 10+ friend relationships
- 15+ messages
- 10+ achievements
- 15+ ratings
- 15+ comments

---

## 8. Điểm Cộng Đã Triển Khai

- ✅ **Theme rõ ràng** - Material-UI inspired design
- ✅ **AI Computer** - Nhiều cấp độ cho game Caro
- ✅ **Hướng dẫn theo kịch bản** - Interactive tutorials
- ✅ **Pagination** - Cho tất cả danh sách

---

## 9. Liên Hệ & Tài Liệu

| Tài liệu | File |
|----------|------|
| Kiến trúc hệ thống | [02-kien-truc-he-thong.md](./02-kien-truc-he-thong.md) |
| Thiết kế Database | [03-thiet-ke-database.md](./03-thiet-ke-database.md) |
| Thiết kế API | [04-thiet-ke-api.md](./04-thiet-ke-api.md) |
| Thiết kế Frontend | [05-thiet-ke-frontend.md](./05-thiet-ke-frontend.md) |
| Hướng dẫn Game | [06-huong-dan-game.md](./06-huong-dan-game.md) |
| Hướng dẫn Cài đặt | [07-huong-dan-cai-dat.md](./07-huong-dan-cai-dat.md) |
| Câu hỏi Vấn đáp | [08-cau-hoi-van-dap.md](./08-cau-hoi-van-dap.md) |
