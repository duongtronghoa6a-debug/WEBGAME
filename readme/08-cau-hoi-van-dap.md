# ❓ Câu Hỏi Vấn Đáp

Tài liệu này tổng hợp các câu hỏi thường gặp trong buổi vấn đáp/bảo vệ đồ án.

---

## 1. Kiến Trúc & Thiết Kế

### Q1: Tại sao chọn kiến trúc MVC?
**A:** MVC (Model-View-Controller) được chọn vì:
- **Tách biệt rõ ràng**: Phân chia logic xử lý, data, và giao diện
- **Dễ bảo trì**: Thay đổi một layer không ảnh hưởng layers khác
- **Dễ test**: Có thể test từng layer độc lập
- **Chuẩn công nghiệp**: Được sử dụng rộng rãi, dễ onboard đội mới

### Q2: Tại sao tách Frontend và Backend?
**A:** 
- **Scalability**: Scale riêng biệt theo nhu cầu
- **Flexibility**: Frontend có thể đổi tech stack mà không ảnh hưởng backend
- **Security**: API là điểm truy cập duy nhất vào data
- **Reusability**: Backend có thể serve nhiều client (web, mobile)

### Q3: Giải thích flow của một request từ client đến database?
**A:**
```
Client → API Request → Middleware (Auth, Validation)
      → Router → Controller → Model → Database
      ← Response ← Controller ← Model (data)
```

---

## 2. Authentication & Security

### Q4: JWT hoạt động như thế nào?
**A:**
1. User đăng nhập với email/password
2. Server verify và tạo JWT token chứa user info
3. Client lưu token (localStorage)
4. Mỗi request gửi kèm token trong header
5. Server verify token, extract user info

### Q5: Tại sao dùng bcrypt để hash password?
**A:**
- **Salt tự động**: Mỗi hash có salt riêng
- **Slow by design**: Chống brute force
- **Industry standard**: Được tin dùng và test kỹ

### Q6: API Key dùng để làm gì?
**A:**
- Bảo vệ API-docs khỏi truy cập công cộng
- Layer bảo mật thêm cho API
- Rate limiting theo key

### Q7: HTTPS quan trọng như thế nào?
**A:**
- Mã hóa toàn bộ traffic
- Ngăn chặn man-in-the-middle attacks
- Bảo vệ credentials và data nhạy cảm
- Yêu cầu bắt buộc cho production

---

## 3. Database

### Q8: Tại sao chọn PostgreSQL (Supabase)?
**A:**
- **JSONB support**: Lưu game state linh hoạt
- **UUID**: ID an toàn, không đoán được
- **Performance**: Tối ưu cho read-heavy applications
- **Supabase**: Real-time, Auth, Storage tích hợp

### Q9: Giải thích cách lưu game state?
**A:**
- Sử dụng JSONB column trong `game_sessions`
- Mỗi game có state structure riêng:
```json
// Caro
{ "board": [[0,1,0,...]], "currentPlayer": 1, "moves": [...] }
// Snake
{ "snake": [{x:5,y:5},...], "food": {x:10,y:10}, "direction": "right" }
```
- Save: Serialize state → API → Database
- Load: Database → API → Deserialize → Resume game

### Q10: Index được sử dụng ở đâu?
**A:**
- `users.email`, `users.username`: Lookup nhanh khi login
- `game_sessions.user_id`: Query sessions của user
- `game_sessions.score DESC`: Ranking queries
- `messages.created_at`: Sort messages

---

## 4. Frontend

### Q11: Tại sao chọn React?
**A:**
- **Component-based**: Tái sử dụng code
- **Virtual DOM**: Performance tốt
- **Ecosystem lớn**: Nhiều thư viện hỗ trợ
- **Community**: Documentation, support tốt

### Q12: Context API vs Redux?
**A:**
- **Context API**: 
  - Đơn giản, built-in React
  - Đủ cho mid-size apps
  - Ít boilerplate
- **Chọn Context** vì app không quá phức tạp về state

### Q13: Giải thích Dark/Light mode?
**A:**
- Sử dụng CSS Variables
- ThemeContext quản lý state theme
- `data-theme` attribute trên root element
- LocalStorage persist preference

### Q14: Pagination được implement như thế nào?
**A:**
- Backend: Query với `LIMIT` và `OFFSET`
- Frontend: Pagination component
- API trả về: `{ data, pagination: { page, total, totalPages } }`

---

## 5. Game Logic

### Q15: Giải thích 5-button control system?
**A:**
- **Concept**: Điều khiển game chỉ với 5 nút
- **LEFT/RIGHT**: Navigation
- **ENTER**: Action/Confirm
- **BACK**: Cancel/Exit
- **HINT**: Help/Instructions
- **Keyboard mapping**: Arrow keys, Enter, Escape, H

### Q16: AI Computer hoạt động như thế nào?
**A:**
**Easy mode:**
- Random nước đi hợp lệ

**Medium mode:**
```
1. Check có thể thắng không → Đánh
2. Check đối thủ sắp thắng → Chặn
3. Random nước gần quân đã có
```

**Hard mode (Điểm cộng):**
- Minimax algorithm với alpha-beta pruning

### Q17: Save/Load game hoạt động như thế nào?
**A:**
**Save:**
1. Serialize game state thành JSON
2. Gọi API `PUT /games/sessions/:id`
3. Lưu vào database

**Load:**
1. Gọi API `GET /games/sessions/:id`
2. Deserialize JSON thành state
3. Initialize game với state đó

---

## 6. Social Features

### Q18: Friend request flow?
**A:**
```
User A gửi request → Status: pending
User B chấp nhận → Status: accepted
                 → User A và B là bạn
User B từ chối → Status: rejected / Xóa record
```

### Q19: Messaging system?
**A:**
- Không real-time (polling hoặc manual refresh)
- Lưu sender_id, receiver_id, content
- Mark as read khi user xem

### Q20: Ranking system?
**A:**
**Types:**
- **Global**: Tất cả users
- **Friends only**: Chỉ bạn bè
- **Personal**: Lịch sử cá nhân

**Query:**
```sql
SELECT user_id, MAX(score) as best_score
FROM game_sessions
WHERE game_id = ?
GROUP BY user_id
ORDER BY best_score DESC
```

---

## 7. Admin Features

### Q21: Admin Dashboard hiển thị gì?
**A:**
- Tổng số users, users mới
- Tổng lượt chơi
- Games phổ biến nhất
- Average rating

### Q22: Game management cho phép làm gì?
**A:**
- Enable/Disable game
- Thay đổi board size
- Thay đổi thời gian
- Xem statistics của game

---

## 8. Testing & QA

### Q23: Làm sao test API?
**A:**
- **Manual**: Postman/Insomnia
- **Automated**: Jest + Supertest
- **API Docs**: Swagger UI try-it-out

### Q24: Làm sao đảm bảo data đủ để demo?
**A:**
- Seeds tạo 6 users với đầy đủ data
- Mỗi chức năng có ≥3 records
- Game sessions, messages, friends, ratings, comments

---

## 9. Deployment

### Q25: HTTPS được setup như thế nào?
**A:**
**Development:**
- Self-signed certificate với OpenSSL

**Production:**
- Let's Encrypt (miễn phí)
- Cloudflare SSL

### Q26: Environment variables quản lý thế nào?
**A:**
- `.env` files (không commit)
- `.env.example` làm template
- Hosting platform's env config

---

## 10. Code Quality

### Q27: Git commit convention?
**A:**
```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
refactor: tái cấu trúc
test: thêm tests
```

### Q28: Project structure tổ chức như thế nào?
**A:**
- **Backend**: MVC folders (controllers, models, routes)
- **Frontend**: Feature-based (components, pages, services)
- **Readme**: Documentation files

---

## 11. Điểm Cộng

### Q29: AI nhiều cấp độ implement như thế nào?
**A:**
- **Easy**: Random
- **Medium**: Rule-based (chặn, tấn công)
- **Hard**: Minimax với depth limit

### Q30: Theme/Material-UI style?
**A:**
- CSS Variables cho theming
- Consistent spacing, colors, typography
- Shadows, transitions, hover effects
