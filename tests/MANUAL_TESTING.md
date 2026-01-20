# 📋 HƯỚNG DẪN TEST THỦ CÔNG

> Checklist test toàn diện cho Board Game Web App  
> **Ngày test**: 20/01/2026  
> **Người test**: Dương Trọng Hòa  
> **MSSV**: 23120127

---

## 🔐 1. AUTHENTICATION

### Chuẩn bị
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### Tài khoản test
| Role | Email | Password |
|------|-------|----------|
| Admin | `01@gmail.com` | `111111` |
| User | `02@gmail.com` | `111111` |

### Test Cases

| # | Mô tả | Bước thực hiện | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|----------------|------------------|:----:|---------|
| 1 | Đăng nhập thành công | Nhập email/password → Login | Redirect /games, navbar hiện username | [x] | ✅ Hoạt động đúng |
| 2 | Đăng nhập sai password | Nhập sai password | Thông báo lỗi | [~] | ⚠️ Không hiện thông báo lỗi trên UI, chỉ reset form |
| 3 | Đăng nhập admin | Login với 01@gmail.com | Dropdown có link "Admin" | [x] | ✅ Link Admin hiển thị |
| 4 | Đăng ký mới | Điền form → Register | Redirect /games, tài khoản được tạo | [x] | ✅ Hoạt động đúng |
| 5 | Logout | Click Đăng xuất | Về trang chủ, navbar hiện "Đăng nhập" | [x] | ✅ Đăng xuất thành công |

---

## 🎮 2. GAMES

### Caro (Game 1, 2, 3)
| # | Mô tả | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|------------------|:----:|---------|
| 1 | Arrow keys di chuyển cursor | Cursor di chuyển trên bàn cờ | [x] | ✅ Cursor di chuyển mượt |
| 2 | Enter đặt quân | Quân X xuất hiện tại cursor | [x] | ✅ Đặt quân X thành công |
| 3 | AI đánh lại | Quân O xuất hiện sau 0.5s | [x] | ✅ AI phản hồi nhanh |
| 4 | Thắng 5 hàng | GameOverDialog hiển, chọn chơi lại hoặc thoát | [x] | ✅ Dialog hiển thị đúng |
| 5 | Timer hoạt động | Đếm ngược/đếm xuôi đúng | [x] | ✅ Timer chạy chính xác |
| 6 | Esc khi đang chơi | ExitDialog hiện, chọn lưu hoặc không lưu | [x] | ✅ Nút Quay lại hoạt động |
| 7 | Auto-load | Vào lại game sau khi lưu → load trạng thái cũ | [x] | ✅ Load game đã lưu |
| 8 | AI Level selector | Có thể chọn level AI bất kỳ lúc nào | [x] | ✅ Selector hiện: Dễ/Trung bình/Khó |

### Rắn Săn Mồi (Game 4)
| # | Mô tả | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|------------------|:----:|---------|
| 1 | Arrow điều khiển | Rắn di chuyển đúng hướng | [x] | ✅ Phản hồi nhanh |
| 2 | Ăn mồi | Điểm +10, rắn dài ra | [x] | ✅ Score tăng đúng |
| 3 | Va tường | Game Over | [x] | ✅ Dialog GameOver hiện |
| 4 | Va thân | Game Over | [x] | ✅ Hoạt động đúng |
| 5 | Space pause | Game tạm dừng | [x] | ✅ Pause/Resume hoạt động |

### Ghép Hàng 3 (Game 5)
| # | Mô tả | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|------------------|:----:|---------|
| 1 | Click viên kẹo | Được highlight | [x] | ✅ Selection hoạt động |
| 2 | Swap 2 viên | Đổi chỗ nếu cạnh nhau | [x] | ✅ Swap thành công |
| 3 | Match 3+ | Biến mất, điểm tăng | [x] | ✅ Match logic đúng |
| 4 | Combo | Cascade effect | [x] | ✅ Combo hoạt động |

### Cờ Trí Nhớ (Game 6)
| # | Mô tả | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|------------------|:----:|---------|
| 1 | Lật thẻ | Thẻ hiện mặt | [x] | ✅ Enter để lật thẻ |
| 2 | Match 2 thẻ | Giữ nguyên open | [x] | ✅ Cặp đúng giữ mở |
| 3 | Không match | Úp lại sau 1s | [x] | ✅ Úp lại đúng thời gian |
| 4 | Hoàn thành | GameOverDialog hiển chiến thắng | [x] | ✅ Dialog thắng cuộc |
| 5 | Esc khi đang chơi | ExitDialog hiện | [x] | ✅ Quay lại hoạt động |
| 6 | Auto-load | Vào lại game → load trạng thái cũ | [x] | ✅ Load game đã lưu |

### Bảng Vẽ (Game 7)
| # | Mô tả | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|------------------|:----:|---------|
| 1 | Chọn màu | Cọ đổi màu | [x] | ✅ Nhấn H để đổi màu |
| 2 | Chọn kích thước | Nét vẽ đổi size | [x] | ✅ Có nhiều size |
| 3 | Vẽ trên canvas | Hiển thị nét vẽ | [x] | ✅ Vẽ bằng Enter+Arrow |
| 4 | Clear | Canvas trắng | [x] | ✅ Nút Xóa tất cả hoạt động |
| 5 | Save | Download ảnh | [x] | ✅ Lưu thành công |

### Tetris (Game 8)
| # | Mô tả | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-------|------------------|:----:|---------|
| 1 | ← → di chuyển | Khối di chuyển ngang | [x] | ✅ Di chuyển mượt |
| 2 | ↑ xoay | Khối xoay 90° | [x] | ✅ Xoay đúng |
| 3 | ↓ rơi nhanh | Khối rơi nhanh | [x] | ✅ Soft drop hoạt động |
| 4 | Clear line | Hàng đầy biến mất, +điểm | [x] | ✅ Clear line đúng |
| 5 | Game over | GameOverDialog hiển | [x] | ✅ Dialog hiển thị |
| 6 | Esc khi đang chơi | ExitDialog hiện | [x] | ✅ Thoát hoạt động |
| 7 | Auto-load | Vào lại game → load trạng thái cũ | [x] | ✅ Load trạng thái |

---


---

## 👥 3. SOCIAL FEATURES

| # | Chức năng | Bước test | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-----------|-----------|------------------|:----:|---------|
| 1 | Profile | Vào /profile | Hiển thị thông tin user | [ ] | ❌ **BUG**: Trang trắng, lỗi component |
| 2 | Edit profile | Đổi username → Save | Thành công | [ ] | ⏭️ Không test được vì Profile lỗi |
| 3 | Friends list | Vào /friends | Danh sách bạn bè | [x] | ✅ Hiển thị GameLover + Lời mời (1) |
| 4 | Add friend | Search → Add | Gửi lời mời thành công | [x] | ✅ Có thanh tìm kiếm |
| 5 | Messages | Vào /messages | Danh sách conversations | [x] | ✅ Hiện chat với CaroMaster |
| 6 | Send message | Chọn chat → Gửi | Tin nhắn hiển thị | [x] | ✅ Gửi tin nhắn hoạt động |
| 7 | Rankings | Vào /rankings | Bảng xếp hạng | [x] | ✅ Hiện ProGamer, CaroMaster, GameLover |
| 8 | Filter ranking | Chọn "Bạn bè" | Chỉ hiện friends | [x] | ✅ Filter hoạt động |
| 9 | Achievements | Vào /achievements | Danh sách thành tựu | [x] | ✅ Hiển thị achievements |

---

## 🔧 4. ADMIN

| # | Chức năng | Bước test | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-----------|-----------|------------------|:----:|---------|
| 1 | Access admin | Login admin → Dropdown → Admin | Vào được /admin | [x] | ✅ Admin Dashboard hiển thị |
| 2 | Dashboard stats | Xem Tổng quan | 6+ thống kê hiển thị | [x] | ✅ 9 Users, 47 Sessions, 17 Messages, 10 Games |
| 3 | Users list | Tab Users | Danh sách users | [x] | ✅ 9 users hiển thị đầy đủ |
| 4 | Ban user | Click Ban | Status đổi thành Banned | [x] | ✅ Nút Ban hoạt động |
| 5 | Games list | Tab Games | Danh sách games | [x] | ✅ 10 games với thông tin chi tiết |
| 6 | Disable game | Toggle Enable | Game bị ẩn | [x] | ✅ Toggle Tắt/Hoạt động hoạt động |
| 7 | Edit board size | Đổi kích thước → Save | Thay đổi được lưu | [x] | ✅ Nút Sửa hoạt động |

---

## 🎨 5. UI/UX

| # | Chức năng | Kết quả mong đợi | Pass | Ghi chú |
|:-:|-----------|------------------|:----:|---------|
| 1 | Dark mode toggle | Nền đổi tối/sáng | [x] | ✅ Toggle hoạt động mượt |
| 2 | Responsive desktop | Layout đầy đủ | [x] | ✅ 1200px+ hiển thị tốt |
| 3 | Responsive mobile | Single column, menu collapse | [x] | ✅ Responsive đúng |
| 4 | Loading spinner | Hiển thị khi load | [x] | ✅ Spinner xuất hiện khi fetch data |
| 5 | 404 page | Truy cập route không tồn tại | [x] | ✅ "404 - Trang không tồn tại" |

---

## 📊 KẾT QUẢ TỔNG HỢP

| Phần | Tổng | Pass | Fail | Tỷ lệ |
|------|:----:|:----:|:----:|:-----:|
| Authentication | 5 | 4 | 1 | 80% |
| Games (Caro) | 8 | 8 | 0 | 100% |
| Games (Snake) | 5 | 5 | 0 | 100% |
| Games (Match3) | 4 | 4 | 0 | 100% |
| Games (Memory) | 6 | 6 | 0 | 100% |
| Games (Drawing) | 5 | 5 | 0 | 100% |
| Games (Tetris) | 7 | 7 | 0 | 100% |
| Social | 9 | 7 | 2 | 78% |
| Admin | 7 | 7 | 0 | 100% |
| UI/UX | 5 | 5 | 0 | 100% |
| **TỔNG** | **61** | **58** | **3** | **95%** |

---

## 📝 GHI CHÚ BUG

| # | Trang | Mô tả bug | Mức độ | Đề xuất fix |
|:-:|-------|-----------|--------|-------------|
| 1 | /login | Không hiện thông báo lỗi khi nhập sai mật khẩu, form chỉ reset | Medium | Thêm error toast/message |
| 2 | /profile | Trang trắng hoàn toàn, console log báo lỗi trong `<Profile>` component | **Critical** | Debug Profile.tsx |
| 3 | /profile | Không thể test Edit Profile do trang lỗi | Medium | Phụ thuộc bug #2 |

---

## 🖼️ SCREENSHOT MINH HỌA

### Authentication
- Login thành công: Redirect đến /games với navbar hiển thị username

### Games
- Snake Game: Game Over dialog với điểm số và nút Chơi lại/Thoát
- Memory Game: Grid thẻ 4x4 với counter lượt

### Social Features
- Friends: Danh sách bạn bè với GameLover + tab Lời mời (1)
- Messages: Chat list với CaroMaster

### Admin Dashboard
- Overview: 9 Users, 47 Sessions, 17 Messages, Top Games chart
- Games Management: 10 games với toggle Tắt/Hoạt động

### UI/UX
- Dark Mode: Giao diện tối hoàn chỉnh
- 404 Page: Thông báo "Trang không tồn tại"

---

## ✅ KẾT LUẬN

**Đánh giá tổng thể**: Ứng dụng hoạt động tốt với **95% test cases pass**.

**Điểm mạnh**:
- Tất cả 8 games hoạt động hoàn hảo với đầy đủ tính năng
- Admin Dashboard hiển thị đúng dữ liệu động (users, sessions, messages)
- UI/UX responsive tốt, dark mode hoạt động mượt
- Social features (Friends, Messages, Rankings) hoạt động đúng

**Cần fix**:
1. **Profile page crash** - Bug nghiêm trọng cần ưu tiên fix
2. **Login error message** - UI/UX improvement

---

**Người thực hiện**: Dương Trọng Hòa  
**MSSV**: 23120127  
**Ngày test**: 20/01/2026
