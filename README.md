# 🎮 Board Game Web Application

Ứng dụng web chơi game dạng bàn cờ với giao diện LED Matrix Display và đầy đủ tính năng xã hội.

## 📋 Tính Năng

### Games (8 games - Giao diện LED Matrix)
- ✅ Caro hàng 5 (AI nhiều cấp độ)
- ✅ Caro hàng 4
- ✅ Tic-tac-toe
- ✅ Rắn săn mồi (Snake)
- ✅ Ghép hàng 3 (Match-3)
- ✅ Cờ trí nhớ (Memory)
- ✅ Bảng vẽ tự do
- ✅ Tetris

**Đặc điểm giao diện:**
- LED Matrix Display với các nút tròn (dots) thay đổi màu sắc
- Điều khiển bằng 5-button controller (Left, Right, Enter, Back, Hint)
- Cursor highlight với hiệu ứng glow
- Menu chọn game dạng pixel art icons

### Người Dùng
- 🔐 Đăng ký / Đăng nhập
- 👤 Quản lý Profile
- 👥 Kết bạn
- 💬 Tin nhắn
- 🏆 Thành tựu
- 📊 Xếp hạng

### Quản Trị
- 📈 Dashboard thống kê
- 👥 Quản lý người dùng
- 🎮 Quản lý games

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Backend | Express.js, Knex.js |
| Database | PostgreSQL (Supabase) |
| Auth | JWT |

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Cập nhật .env với Supabase credentials

npm run migrate
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🎮 Điều Khiển

### 5-Button Controller
| Nút | Chức năng |
|-----|-----------|
| ← → | Di chuyển trái/phải hoặc đổi hướng |
| ↑ ↓ | Di chuyển lên/xuống (dùng keyboard) |
| Enter | Xác nhận / Đặt quân / Chọn |
| Back | Quay lại menu |
| Hint (H) | Gợi ý / Đổi màu (Drawing) |

### Phím tắt
- **Caro/Match-3/Memory**: ← ↑ → ↓ di chuyển, Enter đặt/chọn
- **Snake**: ← → hoặc WASD đổi hướng, Space bắt đầu
- **Tetris**: ← → di chuyển, ↑ xoay, Space thả rơi
- **Drawing**: ← ↑ → ↓ di chuyển, Enter vẽ, H đổi màu

## 📁 Cấu Trúc

```
├── backend/           # Express.js API
├── frontend/          # React App
├── readme/            # Tài liệu thiết kế (tiếng Việt)
└── 16_Games/          # Reference games (C++)
```

## 📚 Tài Liệu

Xem thư mục `readme/` để có tài liệu chi tiết bằng tiếng Việt:
- [Tổng quan dự án](readme/01-tong-quan-du-an.md)
- [Kiến trúc hệ thống](readme/02-kien-truc-he-thong.md)
- [Thiết kế Database](readme/03-thiet-ke-database.md)
- [Thiết kế API](readme/04-thiet-ke-api.md)
- [Thiết kế Frontend](readme/05-thiet-ke-frontend.md)
- [Hướng dẫn Game](readme/06-huong-dan-game.md)
- [Hướng dẫn Cài đặt](readme/07-huong-dan-cai-dat.md)
- [Câu hỏi Vấn đáp](readme/08-cau-hoi-van-dap.md)

## 👥 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@boardgame.com | password123 | Admin |
| player1@example.com | password123 | User |

## 📝 License

ISC
