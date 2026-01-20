# ⚙️ Hướng Dẫn Cài Đặt

## 1. Yêu Cầu Hệ Thống

### Software
- Node.js >= 18.x
- npm >= 9.x
- Git
- Code editor (VS Code recommended)

### Supabase Account
- Đăng ký tại: https://supabase.com
- Tạo project mới

---

## 2. Clone Repository

```bash
git clone <repository-url>
cd board-game-app
```

---

## 3. Cài Đặt Backend

### 3.1. Di chuyển vào thư mục backend
```bash
cd backend
```

### 3.2. Cài đặt dependencies
```bash
npm install
```

### 3.3. Cấu hình Environment
```bash
# Copy file example
cp .env.example .env

# Chỉnh sửa .env với thông tin Supabase của bạn
```

**Nội dung .env:**
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# API Key
API_KEY=your-api-key-for-docs

# Database (lấy từ Supabase)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

### 3.4. Chạy Migrations
```bash
npm run migrate
```

### 3.5. Chạy Seed Data
```bash
npm run seed
```

### 3.6. Khởi động Server
```bash
# Development
npm run dev

# Production
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

---

## 4. Cài Đặt Frontend

### 4.1. Di chuyển vào thư mục frontend
```bash
cd frontend
```

### 4.2. Cài đặt dependencies
```bash
npm install
```

### 4.3. Cấu hình Environment
```bash
cp .env.example .env
```

**Nội dung .env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_KEY=your-api-key
```

### 4.4. Khởi động Development Server
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 5. HTTPS Setup (Local Development)

### 5.1. Tạo Self-Signed Certificate
```bash
cd backend

# Tạo thư mục certs
mkdir certs
cd certs

# Tạo certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 5.2. Cập nhật config
Thêm vào `.env`:
```env
SSL_KEY_PATH=./certs/key.pem
SSL_CERT_PATH=./certs/cert.pem
```

### 5.3. Chạy HTTPS Server
```bash
npm run dev:https
```

---

## 6. Supabase Setup

### 6.1. Tạo Project
1. Đăng nhập https://supabase.com
2. New Project → Đặt tên, chọn region
3. Đợi project khởi tạo

### 6.2. Lấy Credentials
1. Settings → API
2. Copy:
   - Project URL
   - anon public key
   - service_role key
   - Database password

### 6.3. Enable Extensions
Trong SQL Editor chạy:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 7. Kiểm Tra Cài Đặt

### 7.1. Test Backend
```bash
# Health check
curl http://localhost:5000/api/health

# API Docs (cần API Key)
# Mở browser: http://localhost:5000/api-docs
```

### 7.2. Test Frontend
- Mở browser: http://localhost:5173
- Kiểm tra giao diện hiển thị
- Test Dark/Light mode

### 7.3. Test Database
```bash
# Trong thư mục backend
npm run migrate:status
```

---

## 8. Accounts Mặc Định (Sau khi Seed)

| Email | Password | Role |
|-------|----------|------|
| 01@gmail.com | 111111 | Admin |
| 02@gmail.com | 111111 | User |
| 03@gmail.com | 111111 | User |
| 04@gmail.com | 111111 | User |
| 05@gmail.com | 111111 | User |
| 06@gmail.com | 111111 | User |
| 07@gmail.com | 111111 | User |
| 08@gmail.com | 111111 | User |
| 09@gmail.com | 111111 | User |
| 10@gmail.com | 111111 | User |

---

## 9. Scripts Có Sẵn

### Backend
```bash
npm run dev          # Development với nodemon
npm run start        # Production
npm run migrate      # Chạy migrations
npm run migrate:rollback  # Rollback migration
npm run seed         # Chạy seed data
npm run test         # Chạy tests
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Check linting
```

---

## 10. Troubleshooting

### Lỗi kết nối Database
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra IP được whitelist trong Supabase

### Lỗi CORS
- Kiểm tra CORS config trong backend
- Đảm bảo frontend URL được allow

### Lỗi JWT
- Kiểm tra JWT_SECRET có đủ dài (32+ chars)
- Clear localStorage và login lại
