# 🗄️ Thiết Kế Database

## 1. Tổng Quan

### 1.1. Thông Tin Chung
- **Database:** PostgreSQL
- **Provider:** Supabase
- **ORM:** Knex.js
- **Schema:** public

### 1.2. Quy Ước Đặt Tên
- Tên bảng: `snake_case`, số nhiều (users, games, ...)
- Tên cột: `snake_case`
- Primary key: `id`
- Foreign key: `<table_name>_id`
- Timestamp: `created_at`, `updated_at`

---

## 2. Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users     │───┐   │  game_sessions  │   ┌───│    games    │
├─────────────┤   │   ├─────────────────┤   │   ├─────────────┤
│ id (PK)     │   │   │ id (PK)         │   │   │ id (PK)     │
│ email       │   └──►│ user_id (FK)    │   │   │ name        │
│ username    │       │ game_id (FK)◄───┼───┘   │ type        │
│ password    │       │ state           │       │ config      │
│ avatar_url  │       │ score           │       │ enabled     │
│ is_admin    │       │ time_spent      │       │ instructions│
│ created_at  │       │ completed       │       └─────────────┘
│ updated_at  │       │ created_at      │              │
└──────┬──────┘       └─────────────────┘              │
       │                                                │
       │    ┌─────────────┐       ┌─────────────────┐  │
       │    │   friends   │       │     ratings     │  │
       │    ├─────────────┤       ├─────────────────┤  │
       └───►│ user_id(FK) │       │ id (PK)         │  │
       └───►│ friend_id(FK)       │ user_id (FK)◄───┼──┘
            │ status      │       │ game_id (FK)◄───┘
            │ created_at  │       │ stars           │
            └─────────────┘       │ created_at      │
                                  └─────────────────┘
       │
       │    ┌─────────────┐       ┌─────────────────┐
       │    │  messages   │       │    comments     │
       │    ├─────────────┤       ├─────────────────┤
       └───►│ sender_id   │       │ id (PK)         │
       └───►│ receiver_id │       │ user_id (FK)◄───┘
            │ content     │       │ game_id (FK)    │
            │ read        │       │ content         │
            │ created_at  │       │ created_at      │
            └─────────────┘       └─────────────────┘

       │
       │    ┌─────────────────────┐       ┌─────────────┐
       │    │  user_achievements  │       │achievements │
       │    ├─────────────────────┤       ├─────────────┤
       └───►│ user_id (FK)        │◄──────│ id (PK)     │
            │ achievement_id (FK) │───────►│ name        │
            │ unlocked_at         │       │ description │
            └─────────────────────┘       │ icon        │
                                          │ criteria    │
                                          └─────────────┘
```

---

## 3. Chi Tiết Các Bảng

### 3.1. Bảng `users`

Lưu thông tin người dùng hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID người dùng |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Tên hiển thị |
| password_hash | VARCHAR(255) | NOT NULL | Mật khẩu đã hash |
| avatar_url | TEXT | NULL | URL avatar |
| is_admin | BOOLEAN | DEFAULT false | Phân quyền admin |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | DEFAULT NOW() | Thời gian cập nhật |

**Indexes:**
- `idx_users_email` ON email
- `idx_users_username` ON username

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.2. Bảng `games`

Lưu thông tin các game có trong hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | SERIAL | PK | ID game |
| name | VARCHAR(100) | NOT NULL | Tên game |
| type | VARCHAR(50) | NOT NULL | Loại game |
| config | JSONB | DEFAULT '{}' | Cấu hình game |
| enabled | BOOLEAN | DEFAULT true | Trạng thái bật/tắt |
| instructions | TEXT | NULL | Hướng dẫn chơi |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian tạo |

**Config JSONB Structure:**
```json
{
  "boardSize": { "rows": 15, "cols": 15 },
  "winCondition": 5,
  "timeLimit": 300,
  "aiLevels": ["easy", "medium", "hard"]
}
```

```sql
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.3. Bảng `game_sessions`

Lưu các phiên chơi game của người dùng.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK | ID session |
| user_id | UUID | FK → users.id | Người chơi |
| game_id | INTEGER | FK → games.id | Game |
| state | JSONB | NOT NULL | Trạng thái game (save) |
| score | INTEGER | DEFAULT 0 | Điểm số |
| time_spent | INTEGER | DEFAULT 0 | Thời gian chơi (giây) |
| completed | BOOLEAN | DEFAULT false | Đã hoàn thành chưa |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian tạo |
| updated_at | TIMESTAMP | DEFAULT NOW() | Thời gian cập nhật |

**State JSONB Structure (Caro example):**
```json
{
  "board": [[0,1,0,...], [0,0,2,...], ...],
  "currentPlayer": 1,
  "moves": [{"x": 7, "y": 7, "player": 1}, ...],
  "winner": null
}
```

```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_score ON game_sessions(score DESC);
```

---

### 3.4. Bảng `friends`

Quản lý quan hệ bạn bè.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK | ID record |
| user_id | UUID | FK → users.id | Người gửi lời mời |
| friend_id | UUID | FK → users.id | Người nhận lời mời |
| status | VARCHAR(20) | NOT NULL | Trạng thái: pending/accepted/rejected |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian tạo |

```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friends_user ON friends(user_id);
CREATE INDEX idx_friends_friend ON friends(friend_id);
```

---

### 3.5. Bảng `messages`

Lưu tin nhắn giữa người dùng.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK | ID tin nhắn |
| sender_id | UUID | FK → users.id | Người gửi |
| receiver_id | UUID | FK → users.id | Người nhận |
| content | TEXT | NOT NULL | Nội dung tin nhắn |
| read | BOOLEAN | DEFAULT false | Đã đọc chưa |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian gửi |

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

---

### 3.6. Bảng `achievements`

Định nghĩa các thành tựu trong hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | SERIAL | PK | ID thành tựu |
| name | VARCHAR(100) | NOT NULL | Tên thành tựu |
| description | TEXT | NULL | Mô tả |
| icon | VARCHAR(50) | NULL | Icon/emoji |
| criteria | JSONB | NOT NULL | Điều kiện đạt được |

**Criteria JSONB Structure:**
```json
{
  "type": "game_wins",
  "gameId": 1,
  "count": 10
}
```

```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  criteria JSONB NOT NULL
);
```

---

### 3.7. Bảng `user_achievements`

Lưu thành tựu đã đạt được của người dùng.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK | ID record |
| user_id | UUID | FK → users.id | Người dùng |
| achievement_id | INTEGER | FK → achievements.id | Thành tựu |
| unlocked_at | TIMESTAMP | DEFAULT NOW() | Thời gian mở khóa |

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

---

### 3.8. Bảng `ratings`

Đánh giá sao cho game.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK | ID rating |
| user_id | UUID | FK → users.id | Người đánh giá |
| game_id | INTEGER | FK → games.id | Game |
| stars | INTEGER | CHECK (1-5) | Số sao |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian |

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);
```

---

### 3.9. Bảng `comments`

Bình luận về game.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID | PK | ID comment |
| user_id | UUID | FK → users.id | Người bình luận |
| game_id | INTEGER | FK → games.id | Game |
| content | TEXT | NOT NULL | Nội dung |
| created_at | TIMESTAMP | DEFAULT NOW() | Thời gian |

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_game ON comments(game_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
```

---

## 4. Migrations

### 4.1. Danh Sách Migrations

| # | File | Mô tả |
|---|------|-------|
| 1 | 001_create_users_table.js | Tạo bảng users |
| 2 | 002_create_games_table.js | Tạo bảng games |
| 3 | 003_create_game_sessions_table.js | Tạo bảng game_sessions |
| 4 | 004_create_friends_table.js | Tạo bảng friends |
| 5 | 005_create_messages_table.js | Tạo bảng messages |
| 6 | 006_create_achievements_table.js | Tạo bảng achievements |
| 7 | 007_create_user_achievements_table.js | Tạo bảng user_achievements |
| 8 | 008_create_ratings_table.js | Tạo bảng ratings |
| 9 | 009_create_comments_table.js | Tạo bảng comments |

### 4.2. Ví Dụ Migration

```javascript
// migrations/001_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).unique().notNullable();
    table.string('username', 50).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.text('avatar_url');
    table.boolean('is_admin').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

---

## 5. Data Seeding

### 5.1. Users (≥5 người dùng)

```javascript
// seeds/001_users.js
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('users').del();
  
  const password = await bcrypt.hash('password123', 12);
  
  await knex('users').insert([
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'admin@boardgame.com',
      username: 'admin',
      password_hash: password,
      is_admin: true
    },
    {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      email: 'player1@example.com',
      username: 'CaroMaster',
      password_hash: password,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1'
    },
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      email: 'player2@example.com',
      username: 'GameLover',
      password_hash: password,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2'
    },
    {
      id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
      email: 'player3@example.com',
      username: 'NewGamer',
      password_hash: password,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3'
    },
    {
      id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
      email: 'player4@example.com',
      username: 'CasualPlayer',
      password_hash: password,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player4'
    },
    {
      id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
      email: 'player5@example.com',
      username: 'ProGamer',
      password_hash: password,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player5'
    }
  ]);
};
```

### 5.2. Games (7 games)

```javascript
// seeds/002_games.js
exports.seed = async function(knex) {
  await knex('games').del();
  
  await knex('games').insert([
    {
      id: 1,
      name: 'Caro Hàng 5',
      type: 'caro',
      config: JSON.stringify({
        boardSize: { rows: 15, cols: 15 },
        winCondition: 5,
        timeLimit: 600,
        aiLevels: ['easy', 'medium', 'hard']
      }),
      instructions: 'Đặt 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng.'
    },
    {
      id: 2,
      name: 'Caro Hàng 4',
      type: 'caro',
      config: JSON.stringify({
        boardSize: { rows: 10, cols: 10 },
        winCondition: 4,
        timeLimit: 300
      }),
      instructions: 'Đặt 4 quân liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng.'
    },
    {
      id: 3,
      name: 'Tic-Tac-Toe',
      type: 'tictactoe',
      config: JSON.stringify({
        boardSize: { rows: 3, cols: 3 },
        winCondition: 3
      }),
      instructions: 'Đặt 3 quân liên tiếp để chiến thắng trên bàn cờ 3x3.'
    },
    {
      id: 4,
      name: 'Rắn Săn Mồi',
      type: 'snake',
      config: JSON.stringify({
        boardSize: { rows: 20, cols: 20 },
        initialSpeed: 150,
        speedIncrement: 5
      }),
      instructions: 'Điều khiển rắn ăn mồi và tránh va chạm tường hoặc thân rắn.'
    },
    {
      id: 5,
      name: 'Ghép Hàng 3',
      type: 'match3',
      config: JSON.stringify({
        boardSize: { rows: 8, cols: 8 },
        colors: 6,
        timeLimit: 120
      }),
      instructions: 'Di chuyển các viên kẹo để tạo hàng 3 hoặc nhiều hơn cùng màu.'
    },
    {
      id: 6,
      name: 'Cờ Trí Nhớ',
      type: 'memory',
      config: JSON.stringify({
        boardSize: { rows: 4, cols: 4 },
        pairs: 8
      }),
      instructions: 'Lật và ghép các cặp thẻ giống nhau với ít lượt nhất.'
    },
    {
      id: 7,
      name: 'Bảng Vẽ Tự Do',
      type: 'drawing',
      config: JSON.stringify({
        canvasSize: { width: 800, height: 600 },
        brushSizes: [2, 5, 10, 20],
        colors: ['#000', '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff']
      }),
      instructions: 'Vẽ tự do trên canvas với các công cụ màu sắc và kích thước cọ.'
    }
  ]);
};
```

### 5.3. Sample Data Summary

| Bảng | Số lượng | Mô tả |
|------|----------|-------|
| users | 6 | 1 admin + 5 players |
| games | 7 | Đầy đủ 7 game yêu cầu |
| game_sessions | 25 | Player sessions với scores |
| friends | 12 | Relationships giữa players |
| messages | 20 | Conversations |
| achievements | 15 | Các milestones |
| user_achievements | 25 | Unlocked achievements |
| ratings | 18 | Game ratings 1-5 stars |
| comments | 20 | Game comments |

---

## 6. Queries Thường Dùng

### 6.1. Ranking (Top 10 theo game)

```sql
SELECT 
  u.username,
  u.avatar_url,
  MAX(gs.score) as highest_score,
  COUNT(gs.id) as total_games
FROM game_sessions gs
JOIN users u ON gs.user_id = u.id
WHERE gs.game_id = $1 AND gs.completed = true
GROUP BY u.id
ORDER BY highest_score DESC
LIMIT 10;
```

### 6.2. Friends Ranking

```sql
SELECT 
  u.username,
  MAX(gs.score) as highest_score
FROM game_sessions gs
JOIN users u ON gs.user_id = u.id
WHERE gs.game_id = $1 
  AND gs.user_id IN (
    SELECT friend_id FROM friends 
    WHERE user_id = $2 AND status = 'accepted'
    UNION
    SELECT user_id FROM friends 
    WHERE friend_id = $2 AND status = 'accepted'
  )
GROUP BY u.id
ORDER BY highest_score DESC;
```

### 6.3. Statistics Dashboard

```sql
-- Tổng người dùng
SELECT COUNT(*) as total_users FROM users;

-- Tổng lượt chơi
SELECT COUNT(*) as total_plays FROM game_sessions;

-- Game phổ biến nhất
SELECT g.name, COUNT(gs.id) as play_count
FROM games g
LEFT JOIN game_sessions gs ON g.id = gs.game_id
GROUP BY g.id
ORDER BY play_count DESC
LIMIT 5;

-- Người dùng mới trong 7 ngày
SELECT COUNT(*) as new_users 
FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days';
```
