# 🎮 Hướng Dẫn Chơi Game

## Điều Khiển Chung

### 5 Nút Điều Khiển

| Nút | Phím tắt | Chức năng |
|-----|----------|-----------|
| **LEFT** | ← | Di chuyển trái / Chọn mục trước |
| **RIGHT** | → | Di chuyển phải / Chọn mục sau |
| **ENTER** | Enter | Xác nhận / Đánh quân |
| **BACK** | Escape | Quay lại / Thoát |
| **HINT** | H | Gợi ý / Hướng dẫn |

### Phím Bổ Sung
- **↑ ↓**: Di chuyển lên/xuống trong bàn cờ
- **S**: Quick Save
- **L**: Quick Load

---

## 1. Caro Hàng 5

### Luật Chơi
- Bàn cờ 15×15 (có thể tùy chỉnh)
- Hai người chơi lần lượt đặt quân
- Ai có **5 quân liên tiếp** theo hàng ngang, dọc, hoặc chéo sẽ thắng

### Cách Chơi
1. Sử dụng **LEFT/RIGHT/↑/↓** để di chuyển con trỏ
2. Nhấn **ENTER** để đặt quân
3. Nhấn **HINT** để xem gợi ý nước đi

### Tính Điểm
- Thắng: +100 điểm
- Thắng nhanh (< 3 phút): +50 điểm bonus
- Mỗi quân đặt: +1 điểm

### AI Levels
| Level | Mô tả |
|-------|-------|
| Easy | Random nước đi hợp lệ |
| Medium | Chặn 3 quân, ưu tiên tấn công |
| Hard | Minimax algorithm |

---

## 2. Caro Hàng 4

### Luật Chơi
- Bàn cờ 10×10
- **4 quân liên tiếp** để thắng
- Nhanh hơn Caro 5

### Cách Chơi
Tương tự Caro 5, nhưng chỉ cần 4 quân liên tiếp.

---

## 3. Tic-Tac-Toe

### Luật Chơi
- Bàn cờ 3×3
- **3 quân liên tiếp** để thắng
- Game nhanh, quen thuộc

### Cách Chơi
1. Di chuyển đến ô trống
2. Nhấn **ENTER** để đặt X hoặc O
3. Đặt 3 quân thành hàng để thắng

### Tính Điểm
- Thắng: +50 điểm
- Hòa: +10 điểm

---

## 4. Rắn Săn Mồi (Snake)

### Luật Chơi
- Điều khiển rắn ăn mồi
- Rắn dài ra sau mỗi lần ăn
- Tốc độ tăng dần
- Thua khi va tường hoặc thân rắn

### Cách Chơi
1. **LEFT/RIGHT**: Rẽ trái/phải
2. Hoặc dùng **↑ ↓ ← →** để điều khiển
3. Ăn mồi (●) để ghi điểm
4. Tránh va chạm!

### Tính Điểm
- Mỗi mồi: +10 điểm
- Bonus combo: ×1.5 khi ăn liên tục

---

## 5. Ghép Hàng 3 (Match-3)

### Luật Chơi
- Bàn 8×8 với các viên kẹo màu
- Hoán đổi 2 viên cạnh nhau
- Tạo hàng **3 viên cùng màu** trở lên

### Cách Chơi
1. Di chuyển đến viên kẹo muốn chọn
2. Nhấn **ENTER** để chọn
3. Di chuyển đến viên cạnh nhau, nhấn **ENTER** để đổi
4. Tạo combo để ghi điểm cao!

### Tính Điểm
- 3 viên: +30 điểm
- 4 viên: +60 điểm
- 5 viên: +100 điểm
- Combo: ×2 cho mỗi combo liên tiếp

### Thời Gian
- Mặc định: 2 phút
- Hết thời gian = Kết thúc game

---

## 6. Cờ Trí Nhớ (Memory)

### Luật Chơi
- Bàn 4×4 với 8 cặp thẻ úp
- Lật 2 thẻ mỗi lượt
- Nếu khớp → Giữ nguyên
- Nếu không khớp → Úp lại

### Cách Chơi
1. Di chuyển đến thẻ úp
2. Nhấn **ENTER** để lật thẻ đầu tiên
3. Di chuyển và lật thẻ thứ hai
4. Ghi nhớ vị trí để ghép nhanh!

### Tính Điểm
- Ghép đúng: +20 điểm
- Ghép sai: -5 điểm
- Bonus: Hoàn thành trong 1 phút → ×2

---

## 7. Bảng Vẽ Tự Do

### Tính Năng
- Canvas vẽ tự do
- Chọn màu sắc
- Chọn kích thước cọ
- Xóa và lưu tranh

### Cách Dùng
1. **LEFT/RIGHT**: Chọn màu/tool
2. **ENTER**: Xác nhận chọn
3. Click và kéo chuột để vẽ
4. **BACK**: Clear canvas
5. **HINT**: Xem hướng dẫn tools

### Tools
- Bút vẽ (các kích thước)
- Tẩy
- Fill màu
- Lưu tranh (PNG)

---

## Save/Load Game

### Cách Save
1. Trong game, nhấn **S** hoặc mở menu
2. Chọn "Save Game"
3. Game tự động lưu với timestamp

### Cách Load
1. Từ Game Selection, chọn "Saved Games"
2. Chọn session muốn tiếp tục
3. Nhấn **ENTER** để load

---

## Rating & Comment

### Đánh Giá
- Sau khi chơi xong, đánh giá 1-5 sao
- Giúp xếp hạng game phổ biến

### Bình Luận
- Chia sẻ cảm nhận về game
- Xem comment từ người chơi khác
