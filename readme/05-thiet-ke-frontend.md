# 🎨 Thiết Kế Frontend

## 1. Tổng Quan

### 1.1. Tech Stack
- **Framework:** React 18 với Vite
- **Routing:** React Router v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS với CSS Variables

### 1.2. Cấu Trúc Thư Mục

```
frontend/src/
├── components/
│   ├── common/       # Header, Footer, Navbar, ThemeToggle, Pagination
│   ├── games/        # GameBoard, CaroGame, SnakeGame, etc.
│   ├── user/         # ProfileCard, FriendList, MessageList
│   └── admin/        # Sidebar, StatsCard, UserTable
├── layouts/
│   ├── ClientLayout.jsx
│   └── AdminLayout.jsx
├── pages/            # Home, Login, Register, GamePlay, etc.
├── context/          # AuthContext, ThemeContext, GameContext
├── hooks/            # useAuth, useGame, usePagination
├── services/         # API services
├── styles/           # CSS files
├── App.jsx
└── main.jsx
```

---

## 2. Routing

```
/                   → Home
/login              → Login
/register           → Register
/games              → Game Selection
/games/:id/play     → Game Play
/profile            → My Profile
/friends            → Friends (Pagination)
/messages           → Messages (Pagination)
/rankings           → Rankings (Pagination)
/admin              → Admin Dashboard
/admin/users        → User Management
/admin/games        → Game Management
```

---

## 3. Layout Design

### Client Layout
```
┌──────────────────────────────────────┐
│              HEADER                   │
│  Logo                    🌓  Username │
├──────────────────────────────────────┤
│              NAVBAR                   │
│  Home | Games | Rankings | Friends   │
├──────────────────────────────────────┤
│              CONTENT                  │
│         (Page Component)              │
├──────────────────────────────────────┤
│              FOOTER                   │
└──────────────────────────────────────┘
```

### Admin Layout
```
┌──────────────────────────────────────┐
│           ADMIN HEADER               │
├──────────┬───────────────────────────┤
│ SIDEBAR  │       CONTENT             │
│ Dashboard│                           │
│ Users    │   (Admin Pages)           │
│ Games    │                           │
│ Stats    │                           │
└──────────┴───────────────────────────┘
```

---

## 4. Game UI

### Game Play Screen
```
┌──────────────────────────────────────┐
│ < Back         🕐 05:30   Score:1500 │
├──────────────────────────────────────┤
│           ┌─────────────┐            │
│           │ GAME BOARD  │            │
│           │ ┌─┬─┬─┬─┬─┐ │            │
│           │ │O│ │ │X│ │ │            │
│           │ ├─┼─┼─┼─┼─┤ │            │
│           │ │ │X│ │ │O│ │            │
│           │ └─┴─┴─┴─┴─┘ │            │
│           └─────────────┘            │
│   🔵 You (Turn)    🔴 Computer       │
├──────────────────────────────────────┤
│       GAME CONTROLLER (5 Buttons)    │
│  [LEFT] [RIGHT] [ENTER] [BACK] [HINT]│
└──────────────────────────────────────┘
```

---

## 5. Theme System

### Light Theme
```css
[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  --color-primary: #3b82f6;
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  --color-primary: #60a5fa;
}
```

---

## 6. Components

### GameController
- 5 buttons: LEFT, RIGHT, ENTER, BACK, HINT
- Keyboard support: Arrow keys, Enter, Escape, H

### Pagination
- Page numbers với Previous/Next
- Áp dụng cho: Friends, Messages, Rankings

### ThemeToggle
- Switch giữa Light/Dark mode
- Lưu preference vào localStorage
