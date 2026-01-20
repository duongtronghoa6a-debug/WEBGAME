# 📋 HƯỚNG DẪN TEST THỦ CÔNG

> Checklist test toàn diện cho Board Game Web App

---

## 🔐 1. AUTHENTICATION

### Chuẩn bị
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### Tài khoản test
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@boardgame.com` | `password123` |
| User | `player1@example.com` | `password123` |

### Test Cases

| # | Mô tả | Bước thực hiện | Kết quả mong đợi | Pass |
|:-:|-------|----------------|------------------|:----:|
| 1 | Đăng nhập thành công | Nhập email/password → Login | Redirect /games, navbar hiện username | [ ] |
| 2 | Đăng nhập sai password | Nhập sai password | Thông báo lỗi | [ ] |
| 3 | Đăng nhập admin | Login với admin@boardgame.com | Dropdown có link "Admin" | [ ] |
| 4 | Đăng ký mới | Điền form → Register | Redirect /games, tài khoản được tạo | [ ] |
| 5 | Logout | Click Đăng xuất | Về trang chủ, navbar hiện "Đăng nhập" | [ ] |

---

## 🎮 2. GAMES

### Caro (Game 1, 2, 3)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Arrow keys di chuyển cursor | Cursor di chuyển trên bàn cờ | [ ] |
| 2 | Enter đặt quân | Quân X xuất hiện tại cursor | [ ] |
| 3 | AI đánh lại | Quân O xuất hiện sau 0.5s | [ ] |
| 4 | Thắng 5 hàng | Thông báo chiến thắng | [ ] |
| 5 | Timer hoạt động | Đếm ngược/đếm xuôi đúng | [ ] |
| 6 | Save game | Game được lưu, alert xác nhận | [ ] |

### Rắn Săn Mồi (Game 4)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Arrow điều khiển | Rắn di chuyển đúng hướng | [ ] |
| 2 | Ăn mồi | Điểm +10, rắn dài ra | [ ] |
| 3 | Va tường | Game Over | [ ] |
| 4 | Va thân | Game Over | [ ] |
| 5 | Space pause | Game tạm dừng | [ ] |

### Ghép Hàng 3 (Game 5)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Click viên kẹo | Được highlight | [ ] |
| 2 | Swap 2 viên | Đổi chỗ nếu cạnh nhau | [ ] |
| 3 | Match 3+ | Biến mất, điểm tăng | [ ] |
| 4 | Combo | Cascade effect | [ ] |

### Cờ Trí Nhớ (Game 6)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Lật thẻ | Thẻ hiện mặt | [ ] |
| 2 | Match 2 thẻ | Giữ nguyên open | [ ] |
| 3 | Không match | Úp lại sau 1s | [ ] |
| 4 | Hoàn thành | Thông báo thắng | [ ] |

### Bảng Vẽ (Game 7)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Chọn màu | Cọ đổi màu | [ ] |
| 2 | Chọn kích thước | Nét vẽ đổi size | [ ] |
| 3 | Vẽ trên canvas | Hiển thị nét vẽ | [ ] |
| 4 | Clear | Canvas trắng | [ ] |
| 5 | Save | Download ảnh | [ ] |

### Tetris (Game 8)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | ← → di chuyển | Khối di chuyển ngang | [ ] |
| 2 | ↑ xoay | Khối xoay 90° | [ ] |
| 3 | ↓ rơi nhanh | Khối rơi nhanh | [ ] |
| 4 | Clear line | Hàng đầy biến mất, +điểm | [ ] |
| 5 | Game over | Khối chạm đỉnh | [ ] |

### Dò Mìn (Game 11)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Cursor di chuyển | Arrow keys hoạt động | [ ] |
| 2 | Enter mở ô | Ô reveal | [ ] |
| 3 | F cắm cờ | Cờ xuất hiện | [ ] |
| 4 | Mở mìn | Game Over | [ ] |
| 5 | Clear hết ô an toàn | Thắng | [ ] |

### 2048 (Game 18)
| # | Mô tả | Kết quả mong đợi | Pass |
|:-:|-------|------------------|:----:|
| 1 | Arrow di chuyển | Ô trượt đúng hướng | [ ] |
| 2 | Merge | 2+2=4, 4+4=8... | [ ] |
| 3 | Đạt 2048 | Thông báo thắng | [ ] |
| 4 | Không còn move | Game Over | [ ] |

---

## 👥 3. SOCIAL FEATURES

| # | Chức năng | Bước test | Kết quả mong đợi | Pass |
|:-:|-----------|-----------|------------------|:----:|
| 1 | Profile | Vào /profile | Hiển thị thông tin user | [ ] |
| 2 | Edit profile | Đổi username → Save | Thành công | [ ] |
| 3 | Friends list | Vào /friends | Danh sách bạn bè | [ ] |
| 4 | Add friend | Search → Add | Gửi lời mời thành công | [ ] |
| 5 | Messages | Vào /messages | Danh sách conversations | [ ] |
| 6 | Send message | Chọn chat → Gửi | Tin nhắn hiển thị | [ ] |
| 7 | Rankings | Vào /rankings | Bảng xếp hạng | [ ] |
| 8 | Filter ranking | Chọn "Bạn bè" | Chỉ hiện friends | [ ] |
| 9 | Achievements | Vào /achievements | Danh sách thành tựu | [ ] |

---

## 🔧 4. ADMIN

| # | Chức năng | Bước test | Kết quả mong đợi | Pass |
|:-:|-----------|-----------|------------------|:----:|
| 1 | Access admin | Login admin → Dropdown → Admin | Vào được /admin | [ ] |
| 2 | Dashboard stats | Xem Tổng quan | 6+ thống kê hiển thị | [ ] |
| 3 | Users list | Tab Users | Danh sách users | [ ] |
| 4 | Ban user | Click Ban | Status đổi thành Banned | [ ] |
| 5 | Games list | Tab Games | Danh sách games | [ ] |
| 6 | Disable game | Toggle Enable | Game bị ẩn | [ ] |
| 7 | Edit board size | Đổi kích thước → Save | Thay đổi được lưu | [ ] |

---

## 🎨 5. UI/UX

| # | Chức năng | Kết quả mong đợi | Pass |
|:-:|-----------|------------------|:----:|
| 1 | Dark mode toggle | Nền đổi tối/sáng | [ ] |
| 2 | Responsive desktop | Layout đầy đủ | [ ] |
| 3 | Responsive mobile | Single column, menu collapse | [ ] |
| 4 | Loading spinner | Hiển thị khi load | [ ] |
| 5 | 404 page | Truy cập route không tồn tại | [ ] |

---

## 📊 KẾT QUẢ

| Phần | Tổng | Pass | Fail |
|------|:----:|:----:|:----:|
| Authentication | 5 | | |
| Games | 35 | | |
| Social | 9 | | |
| Admin | 7 | | |
| UI/UX | 5 | | |
| **TỔNG** | **61** | | |

---

## 📝 GHI CHÚ BUG

| # | Trang | Mô tả bug | Mức độ |
|:-:|-------|-----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
